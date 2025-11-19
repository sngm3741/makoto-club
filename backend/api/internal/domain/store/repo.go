package store

import (
	"context"

	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
)

// Repo は Store 集約の永続化操作を提供する。
type Repo interface {
	Save(context.Context, *Store) error
	FindByID(context.Context, store_vo.ID) (*Store, error)
	FindByPrefecture(context.Context, store_vo.Prefecture, common_vo.Pagination) ([]*Store, error)
	FindByArea(context.Context, store_vo.Area, common_vo.Pagination) ([]*Store, error)
	Delete(context.Context, store_vo.ID) error
}
