package survey

import "errors"

const (
	// MinAverageEarning は平均稼ぎの最小値
	MinAverageEarning = 0
	// MaxAverageEarning は平均稼ぎの最大値
	MaxAverageEarning = 20
)

// ErrInvalidAverageEarning は平均稼ぎが最小値未満の場合に返される。
var ErrInvalidAverageEarning = errors.New("平均稼ぎは0以上で入力してください")

// AverageEarning は平均稼ぎ(万円)を表す値オブジェクト。
// 上限は 20 万円で丸め、下限は 0 を許容する仕様。
type AverageEarning struct {
	value int
}

// NewAverageEarning は平均稼ぎを検証し、最大値を超える場合は丸める。
func NewAverageEarning(value int) (AverageEarning, error) {
	if value < MinAverageEarning {
		return AverageEarning{}, ErrInvalidAverageEarning
	}
	if value > MaxAverageEarning {
		value = MaxAverageEarning
	}
	return AverageEarning{value: value}, nil
}

// Value は平均稼ぎを返す。
func (e AverageEarning) Value() int {
	return e.value
}

// Equals は別の AverageEarning と一致するか判定する。
func (e AverageEarning) Equals(other AverageEarning) bool {
	return e.value == other.value
}

// Validate は範囲内かどうかを判定する。
func (e AverageEarning) Validate() bool {
	return e.value >= MinAverageEarning && e.value <= MaxAverageEarning
}

// IsZero は未設定かどうかを判定する。
func (e AverageEarning) IsZero() bool {
	return e.value == 0
}
