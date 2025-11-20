package interfaces

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	survey_usecase "github.com/sngm3741/makoto-club-services/api/internal/usecase/survey"
)

type handler struct {
	surveyService survey_usecase.Service
}

type Handler interface {
	GetSurveysByStoreID(w http.ResponseWriter, r *http.Request)
}

func NewHandler(surveyService survey_usecase.Service) Handler {
	return &handler{surveyService: surveyService}
}

func (h *handler) GetSurveysByStoreID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	storeIDParam := chi.URLParam(r, "storeID")
	if storeIDParam == "" {
		http.Error(w, "storeID is required", http.StatusBadRequest)
		return
	}

	storeID, err := store_vo.NewID(storeIDParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	pagination := paginationFromRequest(r)

	surveys, err := h.surveyService.GetByStore(ctx, storeID, pagination)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(surveys); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func paginationFromRequest(r *http.Request) common_vo.Pagination {
	query := r.URL.Query()
	page := parseQueryInt(query.Get("page"))
	limit := parseQueryInt(query.Get("limit"))
	return common_vo.NewPagination(page, limit)
}

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
