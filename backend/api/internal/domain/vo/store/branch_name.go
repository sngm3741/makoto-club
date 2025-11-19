package store

import "strings"

// BranchName は支店名を表す値オブジェクト。空文字も許容される。
type BranchName struct {
	value string
}

// NewBranchName は入力をトリムして支店名 VO を生成する。
func NewBranchName(input string) BranchName {
	return BranchName{value: strings.TrimSpace(input)}
}

// String は内部値を返す。
func (n BranchName) String() string {
	return n.value
}

// Value は内部値を文字列として返す。
func (n BranchName) Value() string {
	return n.value
}

// Equals は別の BranchName と一致するか判定する。
func (n BranchName) Equals(other BranchName) bool {
	return n.value == other.value
}

// Validate は任意項目のため常に true を返す。
func (n BranchName) Validate() bool {
	return true
}

// IsZero は未設定かどうかを判定する。
func (n BranchName) IsZero() bool {
	return n.value == ""
}
