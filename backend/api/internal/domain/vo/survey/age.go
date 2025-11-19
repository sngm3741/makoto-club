package survey

import "errors"

const (
	// MinAge は入力可能な最小年齢
	MinAge = 18
	// MaxAge は入力可能な最大年齢
	MaxAge = 60
)

// ErrInvalidAge は年齢が最小値未満の場合に返される。
var ErrInvalidAge = errors.New("年齢は18歳以上で入力してください")

// Age は回答者の年齢を表す値オブジェクト。
type Age struct {
	value int
}

// NewAge は年齢を検証し、必要に応じて上限へ丸めて返す。
func NewAge(value int) (Age, error) {
	if value < MinAge {
		return Age{}, ErrInvalidAge
	}
	if value > MaxAge {
		value = MaxAge
	}
	return Age{value: value}, nil
}

// Value は年齢を返す。
func (a Age) Value() int {
	return a.value
}

// Equals は別の Age と一致するか判定する。
func (a Age) Equals(other Age) bool {
	return a.value == other.value
}

// Validate は有効な年齢かどうかを判定する。
func (a Age) Validate() bool {
	return a.value >= MinAge && a.value <= MaxAge
}

// IsZero は未設定かどうかを判定する。
func (a Age) IsZero() bool {
	return a.value == 0
}
