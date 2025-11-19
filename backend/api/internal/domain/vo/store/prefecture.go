package store

import (
	"errors"
	"strings"
)

// ErrEmptyPrefecture は都道府県が指定されていない場合に返される。
var ErrEmptyPrefecture = errors.New("都道府県は必須です")

// ErrInvalidPrefecture は存在しない都道府県が指定された場合に返される。
var ErrInvalidPrefecture = errors.New("存在しない都道府県が指定されました")

const (
	PrefectureHokkaido  = "北海道"
	PrefectureAomori    = "青森県"
	PrefectureIwate     = "岩手県"
	PrefectureMiyagi    = "宮城県"
	PrefectureAkita     = "秋田県"
	PrefectureYamagata  = "山形県"
	PrefectureFukushima = "福島県"
	PrefectureIbaraki   = "茨城県"
	PrefectureTochigi   = "栃木県"
	PrefectureGunma     = "群馬県"
	PrefectureSaitama   = "埼玉県"
	PrefectureChiba     = "千葉県"
	PrefectureTokyo     = "東京都"
	PrefectureKanagawa  = "神奈川県"
	PrefectureNiigata   = "新潟県"
	PrefectureToyama    = "富山県"
	PrefectureIshikawa  = "石川県"
	PrefectureFukui     = "福井県"
	PrefectureYamanashi = "山梨県"
	PrefectureNagano    = "長野県"
	PrefectureGifu      = "岐阜県"
	PrefectureShizuoka  = "静岡県"
	PrefectureAichi     = "愛知県"
	PrefectureMie       = "三重県"
	PrefectureShiga     = "滋賀県"
	PrefectureKyoto     = "京都府"
	PrefectureOsaka     = "大阪府"
	PrefectureHyogo     = "兵庫県"
	PrefectureNara      = "奈良県"
	PrefectureWakayama  = "和歌山県"
	PrefectureTottori   = "鳥取県"
	PrefectureShimane   = "島根県"
	PrefectureOkayama   = "岡山県"
	PrefectureHiroshima = "広島県"
	PrefectureYamaguchi = "山口県"
	PrefectureTokushima = "徳島県"
	PrefectureKagawa    = "香川県"
	PrefectureEhime     = "愛媛県"
	PrefectureKochi     = "高知県"
	PrefectureFukuoka   = "福岡県"
	PrefectureSaga      = "佐賀県"
	PrefectureNagasaki  = "長崎県"
	PrefectureKumamoto  = "熊本県"
	PrefectureOita      = "大分県"
	PrefectureMiyazaki  = "宮崎県"
	PrefectureKagoshima = "鹿児島県"
	PrefectureOkinawa   = "沖縄県"
)

var prefectureSet = map[string]struct{}{
	PrefectureHokkaido:  {},
	PrefectureAomori:    {},
	PrefectureIwate:     {},
	PrefectureMiyagi:    {},
	PrefectureAkita:     {},
	PrefectureYamagata:  {},
	PrefectureFukushima: {},
	PrefectureIbaraki:   {},
	PrefectureTochigi:   {},
	PrefectureGunma:     {},
	PrefectureSaitama:   {},
	PrefectureChiba:     {},
	PrefectureTokyo:     {},
	PrefectureKanagawa:  {},
	PrefectureNiigata:   {},
	PrefectureToyama:    {},
	PrefectureIshikawa:  {},
	PrefectureFukui:     {},
	PrefectureYamanashi: {},
	PrefectureNagano:    {},
	PrefectureGifu:      {},
	PrefectureShizuoka:  {},
	PrefectureAichi:     {},
	PrefectureMie:       {},
	PrefectureShiga:     {},
	PrefectureKyoto:     {},
	PrefectureOsaka:     {},
	PrefectureHyogo:     {},
	PrefectureNara:      {},
	PrefectureWakayama:  {},
	PrefectureTottori:   {},
	PrefectureShimane:   {},
	PrefectureOkayama:   {},
	PrefectureHiroshima: {},
	PrefectureYamaguchi: {},
	PrefectureTokushima: {},
	PrefectureKagawa:    {},
	PrefectureEhime:     {},
	PrefectureKochi:     {},
	PrefectureFukuoka:   {},
	PrefectureSaga:      {},
	PrefectureNagasaki:  {},
	PrefectureKumamoto:  {},
	PrefectureOita:      {},
	PrefectureMiyazaki:  {},
	PrefectureKagoshima: {},
	PrefectureOkinawa:   {},
}

// Prefecture は都道府県を表す値オブジェクト。
type Prefecture struct {
	value string
}

// NewPrefecture は都道府県名を検証し、値オブジェクトを生成する。
func NewPrefecture(input string) (Prefecture, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return Prefecture{}, ErrEmptyPrefecture
	}
	if _, ok := prefectureSet[value]; !ok {
		return Prefecture{}, ErrInvalidPrefecture
	}
	return Prefecture{value: value}, nil
}

// String は内部値を返す。
func (p Prefecture) String() string {
	return p.value
}

// Value は内部値を文字列として返す。
func (p Prefecture) Value() string {
	return p.value
}

// Equals は別の Prefecture と一致するか判定する。
func (p Prefecture) Equals(other Prefecture) bool {
	return p.value == other.value
}

// Validate は都道府県が正しく設定されているかを判定する。
func (p Prefecture) Validate() bool {
	_, ok := prefectureSet[p.value]
	return ok
}

// IsZero は未設定かどうかを判定する。
func (p Prefecture) IsZero() bool {
	return p.value == ""
}
