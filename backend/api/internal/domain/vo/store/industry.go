package store

import (
	"errors"
	"strings"
)

// ErrEmptyIndustry は業種が未指定の場合に返される。
var ErrEmptyIndustry = errors.New("業種コードは必須です")

// ErrInvalidIndustry は定義されていない業種が指定された場合に返される。
var ErrInvalidIndustry = errors.New("存在しない業種が指定されました")

const (
	IndustryDeriheru = "デリヘル"
	IndustryHoteheru = "ホテヘル"
	IndustryHakoheru = "箱ヘル"
	IndustrySoap     = "ソープ"
	IndustryDC       = "DC"
	IndustryFuesu    = "風エス"
	IndustryMensesu  = "メンエス"
)

var allowedIndustries = map[string]struct{}{
	IndustryDeriheru: {},
	IndustryHoteheru: {},
	IndustryHakoheru: {},
	IndustrySoap:     {},
	IndustryDC:       {},
	IndustryFuesu:    {},
	IndustryMensesu:  {},
}

// Industry は業種カテゴリを表す値オブジェクト。
type Industry struct {
	value string
}

// NewIndustry は業種を正規化し、値オブジェクトを生成する。
func NewIndustry(input string) (Industry, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return Industry{}, ErrEmptyIndustry
	}
	if _, ok := allowedIndustries[value]; !ok {
		return Industry{}, ErrInvalidIndustry
	}
	return Industry{value: value}, nil
}

// String は内部値を返す。
func (i Industry) String() string {
	return i.value
}

// Value は内部値を文字列として返す。
func (i Industry) Value() string {
	return i.value
}

// Equals は別の Industry と一致するか判定する。
func (i Industry) Equals(other Industry) bool {
	return i.value == other.value
}

// Validate は許可された業種かどうか判定する。
func (i Industry) Validate() bool {
	_, ok := allowedIndustries[i.value]
	return ok
}

// IsZero は未設定かどうかを判定する。
func (i Industry) IsZero() bool {
	return i.value == ""
}
