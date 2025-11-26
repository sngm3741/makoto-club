package store

import "strings"

// UnitPrice は「女子給(60分単価)」を表す。
// バリデーションは行わず、文字列をそのまま保持する。
type UnitPrice struct {
	value string
}

// NewUnitPrice は単価をそのまま値オブジェクトに格納する。
func NewUnitPrice(v string) (UnitPrice, error) {
	return UnitPrice{value: v}, nil
}

// Value は内部値を返す。
func (p UnitPrice) Value() string {
	return p.value
}

// Validate は常に true を返す（バリデーションなし）。
func (p UnitPrice) Validate() bool {
	return true
}

// IsZero は未設定かどうか判定する。
func (p UnitPrice) IsZero() bool {
	return strings.TrimSpace(p.value) == ""
}
