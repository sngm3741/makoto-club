package survey

import (
	"encoding/hex"
	"errors"
	"strings"
)

// ErrEmptyID はアンケートIDが空のときに返される。
var ErrEmptyID = errors.New("アンケートIDが指定されていません")

// ErrInvalidID はアンケートIDが24文字の16進文字列でない場合に返される。
var ErrInvalidID = errors.New("アンケートIDの形式が不正です")

// ID はアンケート集約を一意に識別する値オブジェクト。
type ID struct {
	value string
}

// NewID は入力文字列を検証し、妥当なアンケートID VO を生成する。
func NewID(value string) (ID, error) {
	value = strings.TrimSpace(strings.ToLower(value))
	if value == "" {
		return ID{}, ErrEmptyID
	}
	if len(value) != 24 {
		return ID{}, ErrInvalidID
	}
	if _, err := hex.DecodeString(value); err != nil {
		return ID{}, ErrInvalidID
	}
	return ID{value: value}, nil
}

// String は内部値を返す。
func (i ID) String() string {
	return i.value
}

// Value は内部値を文字列として返す。
func (i ID) Value() string {
	return i.value
}

// Equals は別の ID と一致するか判定する。
func (i ID) Equals(other ID) bool {
	return i.value == other.value
}

// Validate は ID の形式が正しいかを検証する。
func (i ID) Validate() bool {
	if i.value == "" {
		return false
	}
	if len(i.value) != 24 {
		return false
	}
	_, err := hex.DecodeString(i.value)
	return err == nil
}

// IsZero は未設定かどうかを判定する。
func (i ID) IsZero() bool {
	return i.value == ""
}
