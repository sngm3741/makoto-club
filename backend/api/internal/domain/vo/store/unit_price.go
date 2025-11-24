package store

import "errors"

// UnitPrice は「女子給(60分単価)」を表す。
// 整数の円単価で、常識的な範囲を必須チェックする。
type UnitPrice struct {
	value int
}

var (
	// 0 は無効。最低1,000円、上限は1,000,000円を目安に制限。
	ErrInvalidUnitPrice = errors.New("女子給(60分単価)は1,000〜100,000の範囲で入力してください")
	minUnitPrice        = 1000
	maxUnitPrice        = 100_000
)

// NewUnitPrice は単価を検証して値オブジェクトを生成する。
func NewUnitPrice(v int) (UnitPrice, error) {
	if v < minUnitPrice || v > maxUnitPrice {
		return UnitPrice{}, ErrInvalidUnitPrice
	}
	return UnitPrice{value: v}, nil
}

// Value は内部値を返す。
func (p UnitPrice) Value() int {
	return p.value
}

// Validate は値が範囲内か判定する。
func (p UnitPrice) Validate() bool {
	return p.value >= minUnitPrice && p.value <= maxUnitPrice
}

// IsZero は未設定かどうか判定する。
func (p UnitPrice) IsZero() bool {
	return p.value == 0
}
