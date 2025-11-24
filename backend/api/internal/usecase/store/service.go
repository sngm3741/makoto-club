package store

import (
	"context"
	"errors"
	"fmt"

	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"

	store_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/store"
)

// Service は店舗に関するアプリケーションサービス。
type Service interface {
	Save(context.Context, *store_domain.Store) error
	FindByID(context.Context, store_vo.ID) (*store_domain.Store, error)
	FindByPrefecture(context.Context, store_vo.Prefecture, common_vo.Pagination) ([]*store_domain.Store, error)
	FindByArea(context.Context, store_vo.Area, common_vo.Pagination) ([]*store_domain.Store, error)
	Search(context.Context, store_domain.SearchFilter, common_vo.SortKey, common_vo.Pagination) ([]*store_domain.Store, int64, error)
	Delete(context.Context, store_vo.ID) error
}

type service struct {
	repo store_domain.Repo
}

// NewService は StoreService を生成する。
func NewService(repo store_domain.Repo) Service {
	if repo == nil {
		panic("store usecase: repo is nil")
	}
	return &service{repo: repo}
}

// Save は店舗情報を永続化する。
func (s *service) Save(ctx context.Context, store *store_domain.Store) error {
	if store == nil {
		return errors.New("store usecase: store is nil")
	}
	return s.repo.Save(ctx, store)
}

// FindByID は店舗IDで取得する。
func (s *service) FindByID(ctx context.Context, id store_vo.ID) (*store_domain.Store, error) {
	return s.repo.FindByID(ctx, id)
}

// FindByPrefecture は都道府県単位で店舗を取得する。
func (s *service) FindByPrefecture(ctx context.Context, pref store_vo.Prefecture, page common_vo.Pagination) ([]*store_domain.Store, error) {
	return s.repo.FindByPrefecture(ctx, pref, page)
}

// FindByArea はエリア単位で店舗を取得する。
func (s *service) FindByArea(ctx context.Context, area store_vo.Area, page common_vo.Pagination) ([]*store_domain.Store, error) {
	return s.repo.FindByArea(ctx, area, page)
}

// Search は任意条件で店舗一覧を取得する。
func (s *service) Search(ctx context.Context, filter store_domain.SearchFilter, sort common_vo.SortKey, page common_vo.Pagination) ([]*store_domain.Store, int64, error) {
	fmt.Println("サーチがよばれたよ")
	return s.repo.Search(ctx, filter, sort, page)
}

// Delete は店舗を削除する。
func (s *service) Delete(ctx context.Context, id store_vo.ID) error {
	return s.repo.Delete(ctx, id)
}
