package store

import (
	"errors"

	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
)

// Store は店舗の集約を表す。
type Store struct {
	id            store_vo.ID
	name          store_vo.Name
	branchName    *store_vo.BranchName
	prefecture    store_vo.Prefecture
	area          *store_vo.Area
	industry      store_vo.Industry
	genre         *store_vo.Genre
	businessHours *store_vo.BusinessHours
	averageRating store_vo.AverageRating
	createdAt     common_vo.Timestamp
	updatedAt     common_vo.Timestamp
	deletedAt     *common_vo.Timestamp
}

// Option は Store 生成時のオプションを表す。
type Option func(*Store) error

// WithBranchName は支店名を設定する。
func WithBranchName(branch store_vo.BranchName) Option {
	return func(s *Store) error {
		b := branch
		s.branchName = &b
		return nil
	}
}

// WithArea は店舗エリアを設定する。
func WithArea(area store_vo.Area) Option {
	return func(s *Store) error {
		a := area
		s.area = &a
		return nil
	}
}

// WithBusinessHours は営業時間を設定する。
func WithBusinessHours(hours store_vo.BusinessHours) Option {
	return func(s *Store) error {
		h := hours
		s.businessHours = &h
		return nil
	}
}

// WithAverageRating は平均総評を設定する。
func WithAverageRating(rating store_vo.AverageRating) Option {
	return func(s *Store) error {
		s.averageRating = rating
		return nil
	}
}

// WithGenre はジャンルを設定する。
func WithGenre(genre store_vo.Genre) Option {
	return func(s *Store) error {
		g := genre
		s.genre = &g
		return nil
	}
}

// WithCreatedAt は作成日時を設定する。
func WithCreatedAt(ts common_vo.Timestamp) Option {
	return func(s *Store) error {
		s.createdAt = ts
		return nil
	}
}

// WithUpdatedAt は更新日時を設定する。
func WithUpdatedAt(ts common_vo.Timestamp) Option {
	return func(s *Store) error {
		s.updatedAt = ts
		return nil
	}
}

// WithDeletedAt は削除日時を設定する。
func WithDeletedAt(ts common_vo.Timestamp) Option {
	return func(s *Store) error {
		t := ts
		s.deletedAt = &t
		return nil
	}
}

// NewStore は必須の VO を検証し、店舗エンティティを生成する。
func NewStore(
	id store_vo.ID,
	name store_vo.Name,
	prefecture store_vo.Prefecture,
	industry store_vo.Industry,
	opts ...Option,
) (*Store, error) {
	store := &Store{
		id:         id,
		name:       name,
		prefecture: prefecture,
		industry:   industry,
	}

	for _, opt := range opts {
		if err := opt(store); err != nil {
			return nil, err
		}
	}

	if err := store.validate(); err != nil {
		return nil, err
	}
	return store, nil
}

func (s *Store) validate() error {
	if !s.id.Validate() {
		return errors.New("店舗IDの入力値が不正です")
	}
	if !s.name.Validate() {
		return errors.New("店舗名の入力値が不正です")
	}
	if !s.prefecture.Validate() {
		return errors.New("都道府県の入力値が不正です")
	}
	if s.area != nil && !s.area.Validate() {
		return errors.New("エリアの入力値が不正です")
	}
	if !s.industry.Validate() {
		return errors.New("業種の入力値が不正です")
	}
	if s.genre != nil && !s.genre.Validate() {
		return errors.New("ジャンルの入力値が不正です")
	}
	if s.businessHours != nil && !s.businessHours.Validate() {
		return errors.New("営業時間の入力値が不正です")
	}
	if !s.averageRating.IsZero() && !s.averageRating.Validate() {
		return errors.New("平均総評の入力値が不正です")
	}
	if s.createdAt.IsZero() {
		s.createdAt = common_vo.NowTimestamp()
	}
	if s.updatedAt.IsZero() {
		s.updatedAt = s.createdAt
	}
	if !s.createdAt.Validate() || !s.updatedAt.Validate() {
		return errors.New("タイムスタンプの入力値が不正です")
	}
	if s.deletedAt != nil && !s.deletedAt.Validate() {
		return errors.New("削除日時の入力値が不正です")
	}
	return nil
}

// ID は店舗IDを返す。
func (s *Store) ID() store_vo.ID {
	return s.id
}

// Name は店舗名を返す。
func (s *Store) Name() store_vo.Name {
	return s.name
}

// BranchName は支店名を返す。
func (s *Store) BranchName() *store_vo.BranchName {
	return s.branchName
}

// Prefecture は都道府県を返す。
func (s *Store) Prefecture() store_vo.Prefecture {
	return s.prefecture
}

// Area はエリアを返す。
func (s *Store) Area() *store_vo.Area {
	return s.area
}

// Industry は業種を返す。
func (s *Store) Industry() store_vo.Industry {
	return s.industry
}

// Genre はジャンルを返す。
func (s *Store) Genre() *store_vo.Genre {
	return s.genre
}

// BusinessHours は営業時間を返す（未設定の場合は nil）。
func (s *Store) BusinessHours() *store_vo.BusinessHours {
	return s.businessHours
}

// AverageRating は平均総評を返す。
func (s *Store) AverageRating() store_vo.AverageRating {
	return s.averageRating
}

// CreatedAt は作成日時を返す。
func (s *Store) CreatedAt() common_vo.Timestamp {
	return s.createdAt
}

// UpdatedAt は更新日時を返す。
func (s *Store) UpdatedAt() common_vo.Timestamp {
	return s.updatedAt
}

// DeletedAt は削除日時を返す（未削除の場合は nil）。
func (s *Store) DeletedAt() *common_vo.Timestamp {
	return s.deletedAt
}
