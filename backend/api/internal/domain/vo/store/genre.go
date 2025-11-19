package store

import (
	"errors"
	"strings"
)

// ErrEmptyGenre はジャンルが未指定の場合に返される。
var ErrEmptyGenre = errors.New("ジャンルは必須です")

// ErrInvalidGenre は定義されていないジャンルが指定された場合に返される。
var ErrInvalidGenre = errors.New("存在しないジャンルが指定されました")

const (
	GenreMature   = "熟女"
	GenreSchool   = "学園系"
	GenreStandard = "スタンダード"
	GenreBudget   = "格安店"
	GenreLuxury   = "高級店"
)

var allowedGenres = map[string]struct{}{
	GenreMature:   {},
	GenreSchool:   {},
	GenreStandard: {},
	GenreBudget:   {},
	GenreLuxury:   {},
}

// Genre は店舗ジャンルを表す値オブジェクト。
type Genre struct {
	value string
}

// NewGenre はジャンルを検証し、値オブジェクトを生成する。
func NewGenre(input string) (Genre, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return Genre{}, ErrEmptyGenre
	}
	if _, ok := allowedGenres[value]; !ok {
		return Genre{}, ErrInvalidGenre
	}
	return Genre{value: value}, nil
}

// String は内部値を返す。
func (g Genre) String() string {
	return g.value
}

// Value は内部値を文字列として返す。
func (g Genre) Value() string {
	return g.value
}

// Equals は別の Genre と一致するか判定する。
func (g Genre) Equals(other Genre) bool {
	return g.value == other.value
}

// Validate は許可されたジャンルかどうかを判定する。
func (g Genre) Validate() bool {
	_, ok := allowedGenres[g.value]
	return ok
}

// IsZero は未設定かどうかを判定する。
func (g Genre) IsZero() bool {
	return g.value == ""
}
