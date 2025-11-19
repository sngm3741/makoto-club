package survey

import (
	"errors"
	"strings"
)

// ErrEmptyWorkType は勤務形態が未指定の場合に返される。
var ErrEmptyWorkType = errors.New("勤務形態は必須です")

// ErrInvalidWorkType は定義されていない勤務形態が指定された場合に返される。
var ErrInvalidWorkType = errors.New("存在しない勤務形態が指定されました")

const (
	WorkTypeLocal   = "在籍"
	WorkTypeVisitor = "出稼ぎ"
)

var allowedWorkTypes = map[string]struct{}{
	WorkTypeLocal:   {},
	WorkTypeVisitor: {},
}

// WorkType は勤務形態を表す値オブジェクト。
type WorkType struct {
	value string
}

// NewWorkType は勤務形態を検証し、値オブジェクトを生成する。
func NewWorkType(input string) (WorkType, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return WorkType{}, ErrEmptyWorkType
	}
	if _, ok := allowedWorkTypes[value]; !ok {
		return WorkType{}, ErrInvalidWorkType
	}
	return WorkType{value: value}, nil
}

// String は内部値を返す。
func (w WorkType) String() string {
	return w.value
}

// Value は内部値を文字列として返す。
func (w WorkType) Value() string {
	return w.value
}

// Equals は別の勤務形態と一致するか判定する。
func (w WorkType) Equals(other WorkType) bool {
	return w.value == other.value
}

// Validate は許可された勤務形態かどうかを判定する。
func (w WorkType) Validate() bool {
	_, ok := allowedWorkTypes[w.value]
	return ok
}

// IsZero は未設定かどうかを判定する。
func (w WorkType) IsZero() bool {
	return w.value == ""
}
