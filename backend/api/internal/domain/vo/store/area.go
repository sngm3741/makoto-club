package store

import (
	"errors"
	"strings"
)

// ErrEmptyArea はエリアが未指定の場合に返される。
var ErrEmptyArea = errors.New("エリアは必須です")

// ErrInvalidArea は定義されていないエリアが指定された場合に返される。
var ErrInvalidArea = errors.New("存在しないエリアが指定されました")

const (
	AreaYoshiwara = "吉原"
	AreaSusukino  = "すすきの"
	AreaNakasu    = "中洲"
	AreaKabukicho = "歌舞伎町"
	AreaFukuhara  = "福原"
	AreaKawasaki  = "川崎堀之内"
	AreaUmeda     = "梅田"
	AreaKinsan    = "錦三"
)

var allowedAreas = map[string]struct{}{
	AreaYoshiwara: {},
	AreaSusukino:  {},
	AreaNakasu:    {},
	AreaKabukicho: {},
	AreaFukuhara:  {},
	AreaKawasaki:  {},
	AreaUmeda:     {},
	AreaKinsan:    {},
}

// Area は店舗の営業エリアを表す値オブジェクト。
type Area struct {
	value string
}

// NewArea はエリアを検証し、値オブジェクトを生成する。
func NewArea(input string) (Area, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return Area{}, ErrEmptyArea
	}
	if _, ok := allowedAreas[value]; !ok {
		return Area{}, ErrInvalidArea
	}
	return Area{value: value}, nil
}

// String は内部値を返す。
func (a Area) String() string {
	return a.value
}

// Value は内部値を文字列として返す。
func (a Area) Value() string {
	return a.value
}

// Equals は別の Area と一致するか判定する。
func (a Area) Equals(other Area) bool {
	return a.value == other.value
}

// Validate は許可されたエリアかどうかを判定する。
func (a Area) Validate() bool {
	_, ok := allowedAreas[a.value]
	return ok
}

// IsZero は未設定かどうかを判定する。
func (a Area) IsZero() bool {
	return a.value == ""
}
