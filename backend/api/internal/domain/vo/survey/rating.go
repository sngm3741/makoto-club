package survey

import (
	"errors"
	"math"
)

const (
	// MinRating は最小スコア
	MinRating = 0.0
	// MaxRating は最大スコア
	MaxRating = 5.0
)

// ErrInvalidRating はスコアが範囲外の場合に返される。
var ErrInvalidRating = errors.New("総評は0〜5の範囲で入力してください")

// Rating は0.1刻みの総合評価を表す値オブジェクト。
type Rating struct {
	value float64
}

// NewRating は入力を検証し、0.1刻みに丸めて返す。
func NewRating(value float64) (Rating, error) {
	if value < MinRating || value > MaxRating {
		return Rating{}, ErrInvalidRating
	}
	rounded := math.Round(value*10) / 10
	return Rating{value: rounded}, nil
}

// Value は評価値を返す。
func (r Rating) Value() float64 {
	return r.value
}

// Equals は別の Rating と一致するか判定する。
func (r Rating) Equals(other Rating) bool {
	return r.value == other.value
}

// Validate は範囲内かどうかを判定する。
func (r Rating) Validate() bool {
	return r.value >= MinRating && r.value <= MaxRating
}

// IsZero は未設定かどうかを判定する。
func (r Rating) IsZero() bool {
	return r.value == 0
}
