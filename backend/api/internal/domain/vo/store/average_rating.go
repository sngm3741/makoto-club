package store

import (
	"errors"
	"math"
)

const (
	// MinAverageRating は最小平均スコア
	MinAverageRating = 0.0
	// MaxAverageRating は最大平均スコア
	MaxAverageRating = 5.0
)

// ErrInvalidAverageRating は平均スコアが範囲外の場合に返される。
var ErrInvalidAverageRating = errors.New("平均総評は0〜5の範囲で入力してください")

// AverageRating は店舗の平均総合評価を表す。
type AverageRating struct {
	value float64
}

// NewAverageRating は平均値を検証し、0.1刻みに丸める。
func NewAverageRating(value float64) (AverageRating, error) {
	if value < MinAverageRating || value > MaxAverageRating {
		return AverageRating{}, ErrInvalidAverageRating
	}
	rounded := math.Round(value*10) / 10
	return AverageRating{value: rounded}, nil
}

// Value は平均スコアを返す。
func (a AverageRating) Value() float64 {
	return a.value
}

// Equals は別の平均スコアと一致するか判定する。
func (a AverageRating) Equals(other AverageRating) bool {
	return a.value == other.value
}

// Validate は範囲内かどうかを判定する。
func (a AverageRating) Validate() bool {
	return a.value >= MinAverageRating && a.value <= MaxAverageRating
}

// IsZero は未設定かどうかを判定する。
func (a AverageRating) IsZero() bool {
	return a.value == 0
}
