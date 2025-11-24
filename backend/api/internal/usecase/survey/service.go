package survey

import (
	"context"
	"errors"

	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	survey_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/survey"

	survey_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/survey"
)

// Service はアンケートに関するアプリケーションサービス。
type Service interface {
	Create(context.Context, *survey_domain.Survey) error
	Update(context.Context, *survey_domain.Survey) error
	Delete(context.Context, survey_vo.ID) error
	FindByID(context.Context, survey_vo.ID) (*survey_domain.Survey, error)
	GetByStore(context.Context, store_vo.ID, common_vo.SortKey, common_vo.Pagination) ([]*survey_domain.Survey, int64, error)
	GetByPrefecture(context.Context, store_vo.Prefecture, common_vo.SortKey, common_vo.Pagination) ([]*survey_domain.Survey, int64, error)
	ListAdmin(context.Context, survey_domain.AdminFilter, common_vo.SortKey, common_vo.Pagination) ([]*survey_domain.Survey, int64, error)
}

type service struct {
	repo survey_domain.Repo
}

// NewService は SurveyService を生成する。
func NewService(repo survey_domain.Repo) Service {
	if repo == nil {
		panic("survey usecase: repo is nil")
	}
	return &service{repo: repo}
}

// Create はアンケートを新規登録する。
func (s *service) Create(ctx context.Context, survey *survey_domain.Survey) error {
	if survey == nil {
		return errors.New("survey usecase: survey is nil")
	}
	return s.repo.Save(ctx, survey)
}

// Update は既存アンケートを更新する。
func (s *service) Update(ctx context.Context, survey *survey_domain.Survey) error {
	if survey == nil {
		return errors.New("survey usecase: survey is nil")
	}
	return s.repo.Save(ctx, survey)
}

// Delete はアンケートを削除する。
func (s *service) Delete(ctx context.Context, id survey_vo.ID) error {
	return s.repo.Delete(ctx, id)
}

// FindByID はアンケートIDで取得する。
func (s *service) FindByID(ctx context.Context, id survey_vo.ID) (*survey_domain.Survey, error) {
	return s.repo.FindByID(ctx, id)
}

// GetByStore は店舗IDに紐づくアンケートを取得する。
func (s *service) GetByStore(ctx context.Context, storeID store_vo.ID, sort common_vo.SortKey, page common_vo.Pagination) ([]*survey_domain.Survey, int64, error) {
	return s.repo.FindByStore(ctx, storeID, sort, page)
}

// GetByPrefecture は都道府県でアンケートを取得する。
func (s *service) GetByPrefecture(ctx context.Context, pref store_vo.Prefecture, sort common_vo.SortKey, page common_vo.Pagination) ([]*survey_domain.Survey, int64, error) {
	return s.repo.FindByPrefecture(ctx, pref, sort, page)
}

// ListAdmin は管理者用にフィルタ付きでアンケートをページング取得する。
func (s *service) ListAdmin(ctx context.Context, filter survey_domain.AdminFilter, sort common_vo.SortKey, page common_vo.Pagination) ([]*survey_domain.Survey, int64, error) {
	return s.repo.FindAdmin(ctx, filter, sort, page)
}
