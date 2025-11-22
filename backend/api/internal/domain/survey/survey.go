package survey

import (
	"errors"

	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	survey_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/survey"
)

// Survey はアンケートの集約を表す。
type Survey struct {
	id        survey_vo.ID
	storeID   store_vo.ID
	storeName store_vo.Name

	storeBranch   *store_vo.BranchName
	storePref     store_vo.Prefecture
	storeArea     *store_vo.Area
	storeIndustry store_vo.Industry
	storeGenre    *store_vo.Genre

	visitedPeriod survey_vo.VisitedPeriod
	workType      survey_vo.WorkType
	age           survey_vo.Age
	specScore     survey_vo.SpecScore
	waitTime      survey_vo.WaitTimeHours
	averageEarn   survey_vo.AverageEarning
	rating        survey_vo.Rating

	customerComment        *survey_vo.CustomerComment
	staffComment           *survey_vo.StaffComment
	workEnvironmentComment *survey_vo.WorkEnvironmentComment
	emailAddress           survey_vo.EmailAddress
	imageURLs              survey_vo.ImageURLs

	createdAt common_vo.Timestamp
	updatedAt common_vo.Timestamp
	deletedAt *common_vo.Timestamp
}

// Option は Survey 生成時のオプションを表す。
type Option func(*Survey) error

// WithStoreBranch は支店名を設定する。
func WithStoreBranch(branch store_vo.BranchName) Option {
	return func(s *Survey) error {
		b := branch
		s.storeBranch = &b
		return nil
	}
}

// WithStoreArea は店舗エリアを設定する。
func WithStoreArea(area store_vo.Area) Option {
	return func(s *Survey) error {
		a := area
		s.storeArea = &a
		return nil
	}
}

// WithStoreGenre は店舗ジャンルを設定する。
func WithStoreGenre(genre store_vo.Genre) Option {
	return func(s *Survey) error {
		g := genre
		s.storeGenre = &g
		return nil
	}
}

// WithCustomerComment は客層コメントを設定する。
func WithCustomerComment(comment survey_vo.CustomerComment) Option {
	return func(s *Survey) error {
		c := comment
		s.customerComment = &c
		return nil
	}
}

// WithStaffComment はスタッフコメントを設定する。
func WithStaffComment(comment survey_vo.StaffComment) Option {
	return func(s *Survey) error {
		c := comment
		s.staffComment = &c
		return nil
	}
}

// WithWorkEnvironmentComment は職場環境コメントを設定する。
func WithWorkEnvironmentComment(comment survey_vo.WorkEnvironmentComment) Option {
	return func(s *Survey) error {
		c := comment
		s.workEnvironmentComment = &c
		return nil
	}
}

// WithEmailAddress はアンケート回答者のメールアドレスを設定する。
func WithEmailAddress(email survey_vo.EmailAddress) Option {
	return func(s *Survey) error {
		s.emailAddress = email
		return nil
	}
}

// WithImageURLs は画像URLの一覧を設定する。
func WithImageURLs(urls survey_vo.ImageURLs) Option {
	return func(s *Survey) error {
		s.imageURLs = urls
		return nil
	}
}

// WithSurveyTimestamps は作成・更新日時を設定する。
func WithSurveyTimestamps(created, updated common_vo.Timestamp) Option {
	return func(s *Survey) error {
		s.createdAt = created
		s.updatedAt = updated
		return nil
	}
}

// WithSurveyDeletedAt は削除日時を設定する。
func WithSurveyDeletedAt(ts common_vo.Timestamp) Option {
	return func(s *Survey) error {
		t := ts
		s.deletedAt = &t
		return nil
	}
}

// NewSurvey はアンケートを生成する。
func NewSurvey(
	id survey_vo.ID,
	storeID store_vo.ID,
	storeName store_vo.Name,
	storePrefecture store_vo.Prefecture,
	storeIndustry store_vo.Industry,
	visited survey_vo.VisitedPeriod,
	workType survey_vo.WorkType,
	age survey_vo.Age,
	spec survey_vo.SpecScore,
	wait survey_vo.WaitTimeHours,
	average survey_vo.AverageEarning,
	rating survey_vo.Rating,
	opts ...Option,
) (*Survey, error) {
	s := &Survey{
		id:            id,
		storeID:       storeID,
		storeName:     storeName,
		storePref:     storePrefecture,
		storeIndustry: storeIndustry,
		visitedPeriod: visited,
		workType:      workType,
		age:           age,
		specScore:     spec,
		waitTime:      wait,
		averageEarn:   average,
		rating:        rating,
	}

	for _, opt := range opts {
		if err := opt(s); err != nil {
			return nil, err
		}
	}

	if err := s.validate(); err != nil {
		return nil, err
	}

	return s, nil
}

func (s *Survey) validate() error {
	if !s.id.Validate() {
		return errors.New("アンケートIDの入力値が不正です")
	}
	if !s.storeID.Validate() {
		return errors.New("店舗IDの入力値が不正です")
	}
	if !s.storeName.Validate() {
		return errors.New("店舗名の入力値が不正です")
	}
	if !s.storePref.Validate() {
		return errors.New("店舗都道府県の入力値が不正です")
	}
	if s.storeArea != nil && !s.storeArea.Validate() {
		return errors.New("店舗エリアの入力値が不正です")
	}
	if !s.storeIndustry.Validate() {
		return errors.New("店舗業種の入力値が不正です")
	}
	if s.storeGenre != nil && !s.storeGenre.Validate() {
		return errors.New("店舗ジャンルの入力値が不正です")
	}
	if s.storeBranch != nil && !s.storeBranch.Validate() {
		return errors.New("支店名の入力値が不正です")
	}
	if !s.visitedPeriod.Validate() {
		return errors.New("稼働時期の入力値が不正です")
	}
	if !s.workType.Validate() {
		return errors.New("勤務形態の入力値が不正です")
	}
	if !s.age.Validate() {
		return errors.New("年齢の入力値が不正です")
	}
	if !s.specScore.Validate() {
		return errors.New("スペックの入力値が不正です")
	}
	if !s.waitTime.Validate() {
		return errors.New("待機時間の入力値が不正です")
	}
	if !s.averageEarn.Validate() {
		return errors.New("平均稼ぎの入力値が不正です")
	}
	if !s.rating.Validate() {
		return errors.New("総合評価の入力値が不正です")
	}
	if s.customerComment != nil && !s.customerComment.Validate() {
		return errors.New("客層コメントの入力値が不正です")
	}
	if s.staffComment != nil && !s.staffComment.Validate() {
		return errors.New("スタッフコメントの入力値が不正です")
	}
	if s.workEnvironmentComment != nil && !s.workEnvironmentComment.Validate() {
		return errors.New("職場環境コメントの入力値が不正です")
	}
	if !s.emailAddress.Validate() {
		return errors.New("メールアドレスの入力値が不正です")
	}
	if !s.imageURLs.Validate() {
		return errors.New("画像URLの入力値が不正です")
	}
	if s.createdAt.IsZero() {
		s.createdAt = common_vo.NowTimestamp()
	}
	if s.updatedAt.IsZero() {
		s.updatedAt = s.createdAt
	}
	if !s.createdAt.Validate() || !s.updatedAt.Validate() {
		return errors.New("アンケートのタイムスタンプが不正です")
	}
	if s.deletedAt != nil && !s.deletedAt.Validate() {
		return errors.New("アンケートの削除タイムスタンプが不正です")
	}
	return nil
}

// Equals はアンケートIDで同一性を判定する。
func (s *Survey) Equals(other *Survey) bool {
	if other == nil {
		return false
	}
	return s.id.Equals(other.id)
}

// ID はアンケートIDを返す。
func (s *Survey) ID() survey_vo.ID {
	return s.id
}

// StoreID は店舗IDを返す。
func (s *Survey) StoreID() store_vo.ID {
	return s.storeID
}

// StoreName は店舗名を返す。
func (s *Survey) StoreName() store_vo.Name {
	return s.storeName
}

// StoreBranch は支店名を返す（未設定の場合は nil）。
func (s *Survey) StoreBranch() *store_vo.BranchName {
	return s.storeBranch
}

// StorePrefecture は店舗の都道府県を返す。
func (s *Survey) StorePrefecture() store_vo.Prefecture {
	return s.storePref
}

// StoreArea は店舗のエリアを返す。
func (s *Survey) StoreArea() *store_vo.Area {
	return s.storeArea
}

// StoreIndustry は店舗の業種を返す。
func (s *Survey) StoreIndustry() store_vo.Industry {
	return s.storeIndustry
}

// StoreGenre は店舗のジャンルを返す。
func (s *Survey) StoreGenre() *store_vo.Genre {
	return s.storeGenre
}

// VisitedPeriod は稼働時期を返す。
func (s *Survey) VisitedPeriod() survey_vo.VisitedPeriod {
	return s.visitedPeriod
}

// WorkType は勤務形態を返す。
func (s *Survey) WorkType() survey_vo.WorkType {
	return s.workType
}

// Age は年齢を返す。
func (s *Survey) Age() survey_vo.Age {
	return s.age
}

// SpecScore はスペック値を返す。
func (s *Survey) SpecScore() survey_vo.SpecScore {
	return s.specScore
}

// WaitTime は待機時間を返す。
func (s *Survey) WaitTime() survey_vo.WaitTimeHours {
	return s.waitTime
}

// AverageEarning は平均稼ぎを返す。
func (s *Survey) AverageEarning() survey_vo.AverageEarning {
	return s.averageEarn
}

// Rating は総合評価を返す。
func (s *Survey) Rating() survey_vo.Rating {
	return s.rating
}

// CustomerComment は客層コメントを返す。
func (s *Survey) CustomerComment() *survey_vo.CustomerComment {
	return s.customerComment
}

// StaffComment はスタッフコメントを返す。
func (s *Survey) StaffComment() *survey_vo.StaffComment {
	return s.staffComment
}

// WorkEnvironmentComment は職場環境コメントを返す。
func (s *Survey) WorkEnvironmentComment() *survey_vo.WorkEnvironmentComment {
	return s.workEnvironmentComment
}

// EmailAddress は回答者のメールアドレスを返す。
func (s *Survey) EmailAddress() survey_vo.EmailAddress {
	return s.emailAddress
}

// ImageURLs は画像URL一覧を返す。
func (s *Survey) ImageURLs() survey_vo.ImageURLs {
	return s.imageURLs
}

// CreatedAt は作成日時を返す。
func (s *Survey) CreatedAt() common_vo.Timestamp {
	return s.createdAt
}

// UpdatedAt は更新日時を返す。
func (s *Survey) UpdatedAt() common_vo.Timestamp {
	return s.updatedAt
}

// DeletedAt は削除日時を返す（未削除の場合は nil）。
func (s *Survey) DeletedAt() *common_vo.Timestamp {
	return s.deletedAt
}
