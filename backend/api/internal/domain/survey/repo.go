package survey

import (
	"context"

	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	survey_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/survey"
)

// Repo は Survey 集約の永続化操作を提供する。
type Repo interface {
	Save(context.Context, *Survey) error
	FindByID(context.Context, survey_vo.ID) (*Survey, error)
	FindByStore(context.Context, store_vo.ID, common_vo.SortKey, common_vo.Pagination) ([]*Survey, int64, error)
	FindByPrefecture(context.Context, store_vo.Prefecture, common_vo.SortKey, common_vo.Pagination) ([]*Survey, int64, error)
	FindAdmin(context.Context, AdminFilter, common_vo.SortKey, common_vo.Pagination) ([]*Survey, int64, error)
	Delete(context.Context, survey_vo.ID) error
}

// AdminFilter は管理画面での検索条件を表す。
type AdminFilter struct {
	Prefecture *store_vo.Prefecture
	Industry   *store_vo.Industry
	Keyword    string
}
