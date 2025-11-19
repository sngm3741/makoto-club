package survey

import "errors"

const (
	// MinSpecScore は入力可能な最小スペック値
	MinSpecScore = 60
	// MaxSpecScore は入力可能な最大スペック値
	MaxSpecScore = 140
)

// ErrInvalidSpecScore はスペックが最小値未満の場合に返される。
var ErrInvalidSpecScore = errors.New("スペックは60以上で入力してください")

// SpecScore は身長・体重などから算出されるスコアを表す。
type SpecScore struct {
	value int
}

// NewSpecScore は入力値を検証し、最大値を超える場合は丸めて返す。
func NewSpecScore(value int) (SpecScore, error) {
	if value < MinSpecScore {
		return SpecScore{}, ErrInvalidSpecScore
	}
	if value > MaxSpecScore {
		value = MaxSpecScore
	}
	return SpecScore{value: value}, nil
}

// Value はスコアを返す。
func (s SpecScore) Value() int {
	return s.value
}

// Equals は別の SpecScore と一致するか判定する。
func (s SpecScore) Equals(other SpecScore) bool {
	return s.value == other.value
}

// Validate はスコアが範囲内かを判定する。
func (s SpecScore) Validate() bool {
	return s.value >= MinSpecScore && s.value <= MaxSpecScore
}

// IsZero は未設定かどうかを判定する。
func (s SpecScore) IsZero() bool {
	return s.value == 0
}
