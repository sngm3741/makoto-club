package survey

import "strings"

// CastBack はキャストバックの自由記述を表す。
// バリデーションは行わず、トリムした文字列をそのまま保持する。
type CastBack struct {
	value string
}

// NewCastBack はキャストバックを生成する。
func NewCastBack(input string) (CastBack, error) {
	return CastBack{value: strings.TrimSpace(input)}, nil
}

// Value は内部値を返す。
func (c CastBack) Value() string {
	return c.value
}

// Validate は常に true を返す（バリデーションなし）。
func (c CastBack) Validate() bool {
	return true
}

// IsZero は未入力かどうかを判定する。
func (c CastBack) IsZero() bool {
	return strings.TrimSpace(c.value) == ""
}
