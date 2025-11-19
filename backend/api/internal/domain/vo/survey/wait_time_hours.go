package survey

import "errors"

const (
	// MinWaitTimeHours は最小待機時間
	MinWaitTimeHours = 1
	// MaxWaitTimeHours は最大待機時間
	MaxWaitTimeHours = 24
)

// ErrInvalidWaitTime は待機時間が最小値未満の場合に返される。
var ErrInvalidWaitTime = errors.New("待機時間は1時間以上で入力してください")

// WaitTimeHours は待機時間を表す値オブジェクト。
type WaitTimeHours struct {
	value int
}

// NewWaitTimeHours は待機時間を検証し、最大値を超える場合は丸める。
func NewWaitTimeHours(value int) (WaitTimeHours, error) {
	if value < MinWaitTimeHours {
		return WaitTimeHours{}, ErrInvalidWaitTime
	}
	if value > MaxWaitTimeHours {
		value = MaxWaitTimeHours
	}
	return WaitTimeHours{value: value}, nil
}

// Value は待機時間を返す。
func (w WaitTimeHours) Value() int {
	return w.value
}

// Equals は別の WaitTimeHours と一致するか判定する。
func (w WaitTimeHours) Equals(other WaitTimeHours) bool {
	return w.value == other.value
}

// Validate は範囲内かどうかを判定する。
func (w WaitTimeHours) Validate() bool {
	return w.value >= MinWaitTimeHours && w.value <= MaxWaitTimeHours
}

// IsZero は未設定かどうかを判定する。
func (w WaitTimeHours) IsZero() bool {
	return w.value == 0
}
