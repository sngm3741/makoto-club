package survey

import (
	"errors"

	storeVO "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	surveyVO "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/survey"
)

type Survey interface {
	Equals(Survey) bool
}

type survey struct {
	ID      surveyVO.ID
	StoreID storeVO.ID
}

type Option func(Survey)

func NewSurvey(opts ...Option) (Survey, error) {
	survey := &survey{}
	for _, opt := range opts {
		opt(survey)
	}

	if !survey.ID.Validate() {
		return nil, errors.New("アンケートIDの入力値が不正です。")
	}
	if !survey.StoreID.Validate() {
		return nil, errors.New("アンケートに紐付く店舗IDの入力値が不正です。")
	}
	// ...add on

	return survey, nil
}

func (e *survey) Equals(other Survey) bool {
	return false
}
