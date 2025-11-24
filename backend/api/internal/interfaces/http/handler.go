package interfaces

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"

	store_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/store"
	survey_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/survey"
	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	survey_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/survey"
	store_usecase "github.com/sngm3741/makoto-club-services/api/internal/usecase/store"
	survey_usecase "github.com/sngm3741/makoto-club-services/api/internal/usecase/survey"
)

var (
	// デフォルトで同一ネットワーク上の messenger-ingress に投げる。env で上書き可。
	messengerGatewayURL         = strings.TrimSpace(envOrDefault("MESSENGER_GATEWAY_URL", "http://messenger-ingress:8080"))
	messengerGatewayDestination = strings.TrimSpace(envOrDefault("MESSENGER_GATEWAY_DESTINATION", "discord-incoming"))
	httpClient                  = &http.Client{Timeout: 5 * time.Second}
)

// handler は Store/Suvey ユースケースを束ねて HTTP I/O を扱う。
type handler struct {
	storeService  store_usecase.Service
	surveyService survey_usecase.Service
}

// Handler は HTTP 層で外部公開されるハンドラ群を定義する。
// すべて JSON API を想定しており、エラーレスポンスも JSON で返す。
type Handler interface {
	SubmitSurvey(w http.ResponseWriter, r *http.Request)
	CreateStore(w http.ResponseWriter, r *http.Request)
	CreateSurvey(w http.ResponseWriter, r *http.Request)

	DeleteStore(w http.ResponseWriter, r *http.Request)
	DeleteSurvey(w http.ResponseWriter, r *http.Request)

	GetStoreByID(w http.ResponseWriter, r *http.Request)
	GetSurveyByID(w http.ResponseWriter, r *http.Request)
	GetSurveysByStoreID(w http.ResponseWriter, r *http.Request)
	GetAdminSurveyByID(w http.ResponseWriter, r *http.Request)

	ListStores(w http.ResponseWriter, r *http.Request)
	ListAdminStores(w http.ResponseWriter, r *http.Request)
	ListSurveys(w http.ResponseWriter, r *http.Request)
	ListAdminSurveys(w http.ResponseWriter, r *http.Request)

	UpdateStore(w http.ResponseWriter, r *http.Request)
	UpdateSurvey(w http.ResponseWriter, r *http.Request)
}

// NewHandler はユースケースを受け取り、HTTP ハンドラ実装を返す。
// nil が渡された場合は panic し、DI ミスを早期に検知する。
func NewHandler(storeService store_usecase.Service, surveyService survey_usecase.Service) Handler {
	if storeService == nil {
		panic("http handler: store service is nil")
	}
	if surveyService == nil {
		panic("http handler: survey service is nil")
	}
	return &handler{storeService: storeService, surveyService: surveyService}
}

// GetSurveysByStoreID は /stores/{storeID}/surveys の一覧を返す。
// Store 集約の VO を HTTP 応答用構造体へ変換して返却する。
func (h *handler) GetSurveysByStoreID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	storeIDParam := chi.URLParam(r, "storeID")
	if storeIDParam == "" {
		respondError(w, http.StatusBadRequest, "storeID is required")
		return
	}

	storeID, err := store_vo.NewID(storeIDParam)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	pagination := paginationFromRequest(r)
	sortKey := defaultSortKey()

	surveys, _, err := h.surveyService.GetByStore(ctx, storeID, sortKey, pagination)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	responses := make([]surveyResponse, 0, len(surveys))
	for _, survey := range surveys {
		responses = append(responses, newSurveyResponse(survey))
	}

	respondJSON(w, http.StatusOK, responses)
}

// ListSurveys は /surveys の汎用一覧 API。 storeId または prefecture でフィルタする。
func (h *handler) ListSurveys(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	query := r.URL.Query()
	pagination := paginationFromRequest(r)
	sortKey, err := sortKeyFromQuery(query.Get("sort"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	storeIDParam := query.Get("storeId")
	var (
		surveys []*survey_domain.Survey
		total   int64
	)

	filter, err := buildSurveyAdminFilter(query)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	switch {
	case storeIDParam != "":
		storeID, err := store_vo.NewID(storeIDParam)
		if err != nil {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		surveys, total, err = h.surveyService.GetByStore(ctx, storeID, sortKey, pagination)
	default:
		// 公開一覧も AdminFilter を使って prefecture / industry / keyword で検索できるようにする。
		surveys, total, err = h.surveyService.ListAdmin(ctx, filter, sortKey, pagination)
	}

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, newSurveyListResponse(surveys, pagination, total))
}

// ListAdminSurveys は管理用に全アンケートを取得する。
func (h *handler) ListAdminSurveys(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	pagination := paginationFromRequest(r)
	sortKey := defaultSortKey()

	filter, err := buildSurveyAdminFilter(r.URL.Query())
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	surveys, total, err := h.surveyService.ListAdmin(ctx, filter, sortKey, pagination)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, newSurveyListResponse(surveys, pagination, total))
}

// GetAdminSurveyByID は管理者向けに単一アンケートを取得する。
func (h *handler) GetAdminSurveyByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := parseSurveyID(chi.URLParam(r, "surveyID"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	survey, err := h.surveyService.FindByID(ctx, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if survey == nil {
		respondError(w, http.StatusNotFound, "survey not found")
		return
	}

	respondJSON(w, http.StatusOK, newSurveyResponse(survey))
}

// GetSurveyByID はアンケート ID で 1 件取得する。
func (h *handler) GetSurveyByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := parseSurveyID(chi.URLParam(r, "surveyID"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	survey, err := h.surveyService.FindByID(ctx, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if survey == nil {
		respondError(w, http.StatusNotFound, "survey not found")
		return
	}

	respondJSON(w, http.StatusOK, newSurveyResponse(survey))
}

// SubmitSurvey は一般ユーザーの投稿を受け取り、DB には保存せず Discord 通知だけ行う。
func (h *handler) SubmitSurvey(w http.ResponseWriter, r *http.Request) {
	var payload surveyRequest
	if err := decodeJSON(r, &payload); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// HTTPリクエストのキャンセルに引きずられないよう、バックグラウンドで通知を送る。
	go sendSurveyToMessenger(context.Background(), payload)
	respondJSON(w, http.StatusAccepted, map[string]string{"status": "accepted"})
}

// CreateSurvey は管理者が店舗ID付きで登録する経路。
// 店舗メタデータは storeID から取得し、Survey 集約へコピーする。
func (h *handler) CreateSurvey(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var payload surveyRequest
	if err := decodeJSON(r, &payload); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	newID, err := survey_vo.NewID(primitive.NewObjectID().Hex())
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	entity, err := h.buildSurveyEntity(ctx, newID, payload)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.surveyService.Create(ctx, entity); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, newSurveyResponse(entity))
}

// UpdateSurvey は既存アンケートを上書き保存する。
func (h *handler) UpdateSurvey(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := parseSurveyID(chi.URLParam(r, "surveyID"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	var payload surveyRequest
	if err := decodeJSON(r, &payload); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	entity, err := h.buildSurveyEntity(ctx, id, payload)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.surveyService.Update(ctx, entity); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, newSurveyResponse(entity))
}

// DeleteSurvey はアンケートを物理削除する。
func (h *handler) DeleteSurvey(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := parseSurveyID(chi.URLParam(r, "surveyID"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.surveyService.Delete(ctx, id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// CreateStore は店舗を新規作成する。Mongo 互換の ObjectID を自前で生成する。
func (h *handler) CreateStore(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var payload storeRequest
	if err := decodeJSON(r, &payload); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	newID, err := store_vo.NewID(primitive.NewObjectID().Hex())
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	entity, err := buildStoreEntity(newID, payload)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.storeService.Save(ctx, entity); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, newStoreResponse(entity))
}

// UpdateStore は既存店舗の情報を上書きする。
func (h *handler) UpdateStore(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := parseStoreID(chi.URLParam(r, "storeID"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	var payload storeRequest
	if err := decodeJSON(r, &payload); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	entity, err := buildStoreEntity(id, payload)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.storeService.Save(ctx, entity); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, newStoreResponse(entity))
}

// DeleteStore は店舗を物理削除する。
func (h *handler) DeleteStore(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := parseStoreID(chi.URLParam(r, "storeID"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.storeService.Delete(ctx, id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetStoreByID は店舗 ID で 1 件取得する。
func (h *handler) GetStoreByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := parseStoreID(chi.URLParam(r, "storeID"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	store, err := h.storeService.FindByID(ctx, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if store == nil {
		respondError(w, http.StatusNotFound, "store not found")
		return
	}

	respondJSON(w, http.StatusOK, newStoreResponse(store))
}

// ListStores は prefecture もしくは area で店舗一覧を返す。
// 両方指定/どちらも未指定の場合はバリデーションエラーとする。
func (h *handler) ListStores(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	query := r.URL.Query()
	pagination := paginationFromRequest(r)
	sortKey, err := sortKeyFromQuery(query.Get("sort"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	filter, err := buildStoreSearchFilter(query)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	stores, total, err := h.storeService.Search(ctx, filter, sortKey, pagination)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, newStoreListResponse(stores, pagination, total))
}

// ListAdminStores は管理画面向けに柔軟な条件で店舗一覧を返す。
func (h *handler) ListAdminStores(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	pagination := paginationFromRequest(r)

	sortKey, err := sortKeyFromQuery(r.URL.Query().Get("sort"))
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	filter, err := buildStoreSearchFilter(r.URL.Query())
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	stores, total, err := h.storeService.Search(ctx, filter, sortKey, pagination)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, newStoreListResponse(stores, pagination, total))
}

// paginationFromRequest は page/limit クエリを安全に VO へ変換する。
func paginationFromRequest(r *http.Request) common_vo.Pagination {
	query := r.URL.Query()
	page := parseQueryInt(query.Get("page"))
	limit := parseQueryInt(query.Get("limit"))
	return common_vo.NewPagination(page, limit)
}

// parseQueryInt は空文字や不正な数値を 0 に丸めるユーティリティ。
func parseQueryInt(value string) int {
	if value == "" {
		return 0
	}
	v, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}
	return v
}

// parseStoreID は URL パラメータから店舗 ID VO を生成する。
func parseStoreID(value string) (store_vo.ID, error) {
	if value == "" {
		return store_vo.ID{}, errors.New("storeID is required")
	}
	return store_vo.NewID(value)
}

// parseSurveyID は URL パラメータからアンケート ID VO を生成する。
func parseSurveyID(value string) (survey_vo.ID, error) {
	if value == "" {
		return survey_vo.ID{}, errors.New("surveyID is required")
	}
	return survey_vo.NewID(value)
}

func sortKeyFromQuery(value string) (common_vo.SortKey, error) {
	return common_vo.NewSortKey(value)
}

func buildSurveyAdminFilter(values url.Values) (survey_domain.AdminFilter, error) {
	var filter survey_domain.AdminFilter

	if v := strings.TrimSpace(values.Get("prefecture")); v != "" {
		pref, err := store_vo.NewPrefecture(v)
		if err != nil {
			return filter, err
		}
		filter.Prefecture = &pref
	}

	if v := strings.TrimSpace(values.Get("industry")); v != "" {
		industry, err := store_vo.NewIndustry(v)
		if err != nil {
			return filter, err
		}
		filter.Industry = &industry
	}

	if kw := strings.TrimSpace(values.Get("keyword")); kw != "" {
		filter.Keyword = kw
	}
	return filter, nil
}

func defaultSortKey() common_vo.SortKey {
	key, _ := common_vo.NewSortKey("")
	return key
}

// decodeJSON は HTTP リクエストボディを JSON としてデコードする。
func decodeJSON(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	return decoder.Decode(v)
}

// respondJSON は Content-Type を設定し JSON としてボディを書き出す。
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

type errorResponse struct {
	Error string `json:"error"`
}

// respondError は error フィールドのみを持つ JSON 応答を返す。
func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, errorResponse{Error: message})
}

func sendSurveyToMessenger(ctx context.Context, payload surveyRequest) {
	if messengerGatewayURL == "" {
		return
	}

	// 実際のリクエストは独立したタイムアウト付きのバックグラウンドコンテキストで送る。
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Printf("sendSurveyToMessenger dest=%s url=%s", messengerGatewayDestination, messengerGatewayURL)
	storeLabel := strings.TrimSpace(payload.StoreID)
	if storeLabel == "" {
		parts := []string{}
		if v := strings.TrimSpace(payload.StoreName); v != "" {
			parts = append(parts, v)
		}
		if v := strings.TrimSpace(payload.BranchName); v != "" {
			parts = append(parts, v)
		}
		if len(parts) > 0 {
			storeLabel = strings.Join(parts, " / ")
		} else {
			storeLabel = "anonymous"
		}
	}

	lines := []string{
		fmt.Sprintf("店舗名: %s", formatOrNA(payload.StoreName)),
		fmt.Sprintf("支店名: %s", formatOrNA(payload.BranchName)),
		fmt.Sprintf("都道府県: %s", formatOrNA(payload.Prefecture)),
		fmt.Sprintf("業種: %s", formatOrNA(payload.Industry)),
		fmt.Sprintf("働いた時期: %s", formatOrNA(payload.VisitedPeriod)),
		fmt.Sprintf("勤務形態: %s", formatOrNA(payload.WorkType)),
		fmt.Sprintf("年齢: %d", payload.Age),
		fmt.Sprintf("スペック評価: %d", payload.SpecScore),
		fmt.Sprintf("待機時間(時間): %d", payload.WaitTimeHours),
		fmt.Sprintf("平均稼ぎ: %d", payload.AverageEarning),
		fmt.Sprintf("総合評価: %.1f", payload.Rating),
	}

	lines = append(lines, fmt.Sprintf("客層について: %s", trimOrEmpty(payload.CustomerComment)))
	lines = append(lines, fmt.Sprintf("スタッフについて: %s", trimOrEmpty(payload.StaffComment)))
	lines = append(lines, fmt.Sprintf("職場の環境について: %s", trimOrEmpty(payload.WorkEnvironmentComment)))
	if payload.EmailAddress != nil {
		lines = append(lines, fmt.Sprintf("連絡先: %s", strings.TrimSpace(*payload.EmailAddress)))
	}
	if len(payload.ImageURLs) > 0 {
		lines = append(lines, fmt.Sprintf("画像URL: %s", strings.Join(payload.ImageURLs, ", ")))
	}

	text := "【新規アンケート】\n" + strings.Join(lines, "\n")

	reqBody := map[string]string{
		"destination": messengerGatewayDestination,
		"userId":      storeLabel,
		"text":        text,
	}

	buf, err := json.Marshal(reqBody)
	if err != nil {
		log.Printf("failed to marshal messenger request: %v", err)
		return
	}

	url := messengerGatewayURL
	if !strings.HasSuffix(url, "/send") {
		url = strings.TrimRight(url, "/") + "/send"
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		log.Printf("failed to build messenger request: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		log.Printf("failed to send messenger request: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		log.Printf("messenger request returned status %d", resp.StatusCode)
	}
}

func envOrDefault(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func formatOrNA(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return "未入力"
	}
	return s
}

func trimOrEmpty(s *string) string {
	if s == nil {
		return ""
	}
	return strings.TrimSpace(*s)
}

// buildStoreEntity は HTTP リクエストを VO 群へ変換し、Store 集約を生成する。
func buildStoreEntity(id store_vo.ID, payload storeRequest) (*store_domain.Store, error) {
	name, err := store_vo.NewName(payload.Name)
	if err != nil {
		return nil, err
	}
	pref, err := store_vo.NewPrefecture(payload.Prefecture)
	if err != nil {
		return nil, err
	}
	industry, err := store_vo.NewIndustry(payload.Industry)
	if err != nil {
		return nil, err
	}

	options := []store_domain.Option{}
	if payload.BranchName != nil {
		branch, err := store_vo.NewBranchName(*payload.BranchName)
		if err != nil {
			return nil, err
		}
		options = append(options, store_domain.WithBranchName(branch))
	}
	if payload.Area != nil {
		area, err := store_vo.NewArea(*payload.Area)
		if err != nil {
			return nil, err
		}
		options = append(options, store_domain.WithArea(area))
	}
	if payload.Genre != nil {
		genre, err := store_vo.NewGenre(*payload.Genre)
		if err != nil {
			return nil, err
		}
		options = append(options, store_domain.WithGenre(genre))
	}
	if payload.BusinessHours != nil {
		hours, err := store_vo.NewBusinessHours(payload.BusinessHours.Open, payload.BusinessHours.Close)
		if err != nil {
			return nil, err
		}
		options = append(options, store_domain.WithBusinessHours(hours))
	}

	return store_domain.NewStore(id, name, pref, industry, options...)
}

// newStoreResponse は Store 集約を HTTP レスポンスに変換する。
func newStoreResponse(entity *store_domain.Store) storeResponse {
	resp := storeResponse{
		ID:            entity.ID().Value(),
		Name:          entity.Name().Value(),
		Prefecture:    entity.Prefecture().Value(),
		Industry:      entity.Industry().Value(),
		AverageRating: entity.AverageRating().Value(),
		CreatedAt:     entity.CreatedAt().Value(),
		UpdatedAt:     entity.UpdatedAt().Value(),
	}
	if branch := entity.BranchName(); branch != nil {
		value := branch.Value()
		resp.BranchName = &value
	}
	if area := entity.Area(); area != nil {
		value := area.Value()
		resp.Area = &value
	}
	if genre := entity.Genre(); genre != nil {
		value := genre.Value()
		resp.Genre = &value
	}
	if hours := entity.BusinessHours(); hours != nil {
		resp.BusinessHours = &businessHoursPayload{
			Open:  hours.OpenString(),
			Close: hours.CloseString(),
		}
	}
	if deleted := entity.DeletedAt(); deleted != nil {
		value := deleted.Value()
		resp.DeletedAt = &value
	}
	return resp
}

func newStoreListResponse(entities []*store_domain.Store, page common_vo.Pagination, total int64) storeListResponse {
	items := make([]storeResponse, 0, len(entities))
	for _, entity := range entities {
		items = append(items, newStoreResponse(entity))
	}
	return storeListResponse{
		Items: items,
		Page:  page.Page(),
		Limit: page.Limit(),
		Total: total,
	}
}

type storeRequest struct {
	Name          string                `json:"name"`
	BranchName    *string               `json:"branchName"`
	Prefecture    string                `json:"prefecture"`
	Area          *string               `json:"area"`
	Industry      string                `json:"industry"`
	Genre         *string               `json:"genre"`
	BusinessHours *businessHoursPayload `json:"businessHours"`
}

type businessHoursPayload struct {
	Open  string `json:"open"`
	Close string `json:"close"`
}

type storeResponse struct {
	ID            string                `json:"id"`
	Name          string                `json:"name"`
	BranchName    *string               `json:"branchName,omitempty"`
	Prefecture    string                `json:"prefecture"`
	Area          *string               `json:"area,omitempty"`
	Industry      string                `json:"industry"`
	Genre         *string               `json:"genre,omitempty"`
	BusinessHours *businessHoursPayload `json:"businessHours,omitempty"`
	AverageRating float64               `json:"averageRating"`
	CreatedAt     time.Time             `json:"createdAt"`
	UpdatedAt     time.Time             `json:"updatedAt"`
	DeletedAt     *time.Time            `json:"deletedAt,omitempty"`
}

type storeListResponse struct {
	Items []storeResponse `json:"items"`
	Page  int             `json:"page"`
	Limit int             `json:"limit"`
	Total int64           `json:"total"`
}

type surveyRequest struct {
	StoreName              string   `json:"storeName,omitempty"`
	BranchName             string   `json:"branchName,omitempty"`
	Prefecture             string   `json:"prefecture,omitempty"`
	Industry               string   `json:"industry,omitempty"`
	StoreID                string   `json:"storeId,omitempty"`
	VisitedPeriod          string   `json:"visitedPeriod"`
	WorkType               string   `json:"workType"`
	Age                    int      `json:"age"`
	SpecScore              int      `json:"specScore"`
	WaitTimeHours          int      `json:"waitTimeHours"`
	AverageEarning         int      `json:"averageEarning"`
	Rating                 float64  `json:"rating"`
	CustomerComment        *string  `json:"customerComment"`
	StaffComment           *string  `json:"staffComment"`
	WorkEnvironmentComment *string  `json:"workEnvironmentComment"`
	EmailAddress           *string  `json:"emailAddress"`
	ImageURLs              []string `json:"imageUrls"`
}

type surveyResponse struct {
	ID                     string     `json:"id"`
	StoreID                string     `json:"storeId"`
	StoreName              string     `json:"storeName"`
	StoreBranch            *string    `json:"storeBranch,omitempty"`
	StorePrefecture        string     `json:"storePrefecture"`
	StoreArea              *string    `json:"storeArea,omitempty"`
	StoreIndustry          string     `json:"storeIndustry"`
	StoreGenre             *string    `json:"storeGenre,omitempty"`
	VisitedPeriod          string     `json:"visitedPeriod"`
	WorkType               string     `json:"workType"`
	Age                    int        `json:"age"`
	SpecScore              int        `json:"specScore"`
	WaitTimeHours          int        `json:"waitTimeHours"`
	AverageEarning         int        `json:"averageEarning"`
	Rating                 float64    `json:"rating"`
	CustomerComment        *string    `json:"customerComment,omitempty"`
	StaffComment           *string    `json:"staffComment,omitempty"`
	WorkEnvironmentComment *string    `json:"workEnvironmentComment,omitempty"`
	EmailAddress           *string    `json:"emailAddress,omitempty"`
	ImageURLs              []string   `json:"imageUrls,omitempty"`
	CreatedAt              time.Time  `json:"createdAt"`
	UpdatedAt              time.Time  `json:"updatedAt"`
	DeletedAt              *time.Time `json:"deletedAt,omitempty"`
}

type surveyListResponse struct {
	Items []surveyResponse `json:"items"`
	Page  int              `json:"page"`
	Limit int              `json:"limit"`
	Total int64            `json:"total"`
}

func buildStoreSearchFilter(values url.Values) (store_domain.SearchFilter, error) {
	var filter store_domain.SearchFilter

	if v := strings.TrimSpace(values.Get("prefecture")); v != "" {
		pref, err := store_vo.NewPrefecture(v)
		if err != nil {
			return store_domain.SearchFilter{}, err
		}
		filter.Prefecture = &pref
	}
	if v := strings.TrimSpace(values.Get("area")); v != "" {
		area, err := store_vo.NewArea(v)
		if err != nil {
			return store_domain.SearchFilter{}, err
		}
		filter.Area = &area
	}
	if v := strings.TrimSpace(values.Get("industry")); v != "" {
		industry, err := store_vo.NewIndustry(v)
		if err != nil {
			return store_domain.SearchFilter{}, err
		}
		filter.Industry = &industry
	}
	if v := strings.TrimSpace(values.Get("genre")); v != "" {
		genre, err := store_vo.NewGenre(v)
		if err != nil {
			return store_domain.SearchFilter{}, err
		}
		filter.Genre = &genre
	}
	if keyword := strings.TrimSpace(values.Get("name")); keyword != "" {
		filter.NameKeyword = keyword
	}

	return filter, nil
}

// buildSurveyEntity は店舗情報を読み出し、Survey 集約を構築する。
func (h *handler) buildSurveyEntity(ctx context.Context, id survey_vo.ID, payload surveyRequest) (*survey_domain.Survey, error) {
	storeID, err := store_vo.NewID(payload.StoreID)
	if err != nil {
		return nil, err
	}
	store, err := h.storeService.FindByID(ctx, storeID)
	if err != nil {
		return nil, err
	}
	if store == nil {
		return nil, errors.New("store not found")
	}
	visited, err := survey_vo.NewVisitedPeriod(payload.VisitedPeriod)
	if err != nil {
		return nil, err
	}
	workType, err := survey_vo.NewWorkType(payload.WorkType)
	if err != nil {
		return nil, err
	}
	age, err := survey_vo.NewAge(payload.Age)
	if err != nil {
		return nil, err
	}
	spec, err := survey_vo.NewSpecScore(payload.SpecScore)
	if err != nil {
		return nil, err
	}
	waitTime, err := survey_vo.NewWaitTimeHours(payload.WaitTimeHours)
	if err != nil {
		return nil, err
	}
	averageEarning, err := survey_vo.NewAverageEarning(payload.AverageEarning)
	if err != nil {
		return nil, err
	}
	rating, err := survey_vo.NewRating(payload.Rating)
	if err != nil {
		return nil, err
	}

	opts := make([]survey_domain.Option, 0, 6)
	if branch := store.BranchName(); branch != nil {
		opts = append(opts, survey_domain.WithStoreBranch(*branch))
	}
	if area := store.Area(); area != nil {
		opts = append(opts, survey_domain.WithStoreArea(*area))
	}
	if genre := store.Genre(); genre != nil {
		opts = append(opts, survey_domain.WithStoreGenre(*genre))
	}
	if payload.CustomerComment != nil {
		comment, err := survey_vo.NewCustomerComment(*payload.CustomerComment)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithCustomerComment(comment))
	}
	if payload.StaffComment != nil {
		comment, err := survey_vo.NewStaffComment(*payload.StaffComment)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithStaffComment(comment))
	}
	if payload.WorkEnvironmentComment != nil {
		comment, err := survey_vo.NewWorkEnvironmentComment(*payload.WorkEnvironmentComment)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithWorkEnvironmentComment(comment))
	}
	if payload.EmailAddress != nil {
		email, err := survey_vo.NewEmailAddress(*payload.EmailAddress)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithEmailAddress(email))
	}
	if len(payload.ImageURLs) > 0 {
		urls, err := survey_vo.NewImageURLs(payload.ImageURLs)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithImageURLs(urls))
	}

	return survey_domain.NewSurvey(
		id,
		storeID,
		store.Name(),
		store.Prefecture(),
		store.Industry(),
		visited,
		workType,
		age,
		spec,
		waitTime,
		averageEarning,
		rating,
		opts...,
	)
}

// newSurveyResponse は Survey 集約を HTTP レスポンスに変換する。
func newSurveyResponse(entity *survey_domain.Survey) surveyResponse {
	resp := surveyResponse{
		ID:              entity.ID().Value(),
		StoreID:         entity.StoreID().Value(),
		StoreName:       entity.StoreName().Value(),
		StorePrefecture: entity.StorePrefecture().Value(),
		StoreIndustry:   entity.StoreIndustry().Value(),
		VisitedPeriod:   entity.VisitedPeriod().Value().Format("2006-01"),
		WorkType:        entity.WorkType().Value(),
		Age:             entity.Age().Value(),
		SpecScore:       entity.SpecScore().Value(),
		WaitTimeHours:   entity.WaitTime().Value(),
		AverageEarning:  entity.AverageEarning().Value(),
		Rating:          entity.Rating().Value(),
		CreatedAt:       entity.CreatedAt().Value(),
		UpdatedAt:       entity.UpdatedAt().Value(),
	}
	if branch := entity.StoreBranch(); branch != nil {
		value := branch.Value()
		resp.StoreBranch = &value
	}
	if area := entity.StoreArea(); area != nil {
		value := area.Value()
		resp.StoreArea = &value
	}
	if genre := entity.StoreGenre(); genre != nil {
		value := genre.Value()
		resp.StoreGenre = &value
	}
	if comment := entity.CustomerComment(); comment != nil {
		value := comment.Value()
		resp.CustomerComment = &value
	}
	if comment := entity.StaffComment(); comment != nil {
		value := comment.Value()
		resp.StaffComment = &value
	}
	if comment := entity.WorkEnvironmentComment(); comment != nil {
		value := comment.Value()
		resp.WorkEnvironmentComment = &value
	}
	if email := entity.EmailAddress(); !email.IsZero() {
		value := email.Value()
		resp.EmailAddress = &value
	}
	if urls := entity.ImageURLs().Strings(); len(urls) > 0 {
		resp.ImageURLs = urls
	}
	if deleted := entity.DeletedAt(); deleted != nil {
		value := deleted.Value()
		resp.DeletedAt = &value
	}
	return resp
}

func newSurveyListResponse(entities []*survey_domain.Survey, page common_vo.Pagination, total int64) surveyListResponse {
	items := make([]surveyResponse, 0, len(entities))
	for _, survey := range entities {
		items = append(items, newSurveyResponse(survey))
	}
	return surveyListResponse{
		Items: items,
		Page:  page.Page(),
		Limit: page.Limit(),
		Total: total,
	}
}
