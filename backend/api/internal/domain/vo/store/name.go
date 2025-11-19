package store

import (
	"errors"
	"strings"
)

// ErrEmptyName は店舗名が空文字の場合に返される。
var ErrEmptyName = errors.New("店舗名は必須です")

// Name は店舗の名称を表す値オブジェクト。
type Name struct {
	value string
}

// NewName は店舗名をトリムし、必須チェックを行った上で値オブジェクトを返す。
func NewName(input string) (Name, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return Name{}, ErrEmptyName
	}
	return Name{value: value}, nil
}

// String は内部値を返す。
func (n Name) String() string {
	return n.value
}

// Value は内部値を文字列として返す。
func (n Name) Value() string {
	return n.value
}

// Equals は別の Name と一致するか判定する。
func (n Name) Equals(other Name) bool {
	return n.value == other.value
}

// Validate は値が空でないかどうかを判定する。
func (n Name) Validate() bool {
	return n.value != ""
}

// IsZero は未設定かどうかを判定する。
func (n Name) IsZero() bool {
	return n.value == ""
}
