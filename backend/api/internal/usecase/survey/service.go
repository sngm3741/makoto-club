package survey

import (
	"context"

	survey_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/survey"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
)

type Service interface {
	GetByStoreID(context.Context, store_vo.ID) ([]survey_domain.Survey, error)
}

type service struct {
	get Get
}

func NewService(get Get) Service {
	return &service{
		get: get,
	}
}

func (s *service) GetByStoreID(ctx context.Context, storeID store_vo.ID) ([]survey_domain.Survey, error) {
	return s.get.ByStoreID(ctx, storeID)
}
