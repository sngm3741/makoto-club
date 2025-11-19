package survey

import (
	"context"

	store_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/store"
	survey_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/survey"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
)

type Get interface {
	ByStoreID(context.Context, store_vo.ID) ([]survey_domain.Survey, error)
	ByPrefectures(context.Context, string) ([]survey_domain.Survey, error)
	// ... add on
}

type get struct {
	storeRepo  store_domain.Repo
	surveyRepo survey_domain.Repo
}

func NewGet(storeRepo store_domain.Repo, surveyRepo survey_domain.Repo) Get {
	return &get{
		storeRepo:  storeRepo,
		surveyRepo: surveyRepo,
	}
}

func (u *get) ByStoreID(ctx context.Context, id store_vo.ID) ([]survey_domain.Survey, error) {
	return u.surveyRepo.FindByStore(ctx, id)
}

func (u *get) ByPrefectures(ctx context.Context, pref string) ([]survey_domain.Survey, error) {
	// return u.surveyRepo.FindByPrefecture(ctx, pref)
	return nil, nil
}
