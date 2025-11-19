package store

import (
	"encoding/hex"
	"errors"
	"strings"
)

// ErrEmptyID は店舗IDが指定されていない場合に返される。
var ErrEmptyID = errors.New("店舗IDが指定されていません")

// ErrInvalidID は店舗IDが24文字の16進文字列でない場合に返される。
var ErrInvalidID = errors.New("店舗IDの形式が不正です")

// ID は MongoDB の ObjectID 互換の24文字16進文字列で表される店舗識別子。
type ID struct {
	value string
}

// NewID は入力文字列を検証し、妥当な店舗ID VO を生成する。
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

// String は内部値をそのまま返す。
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

// IsZero は未設定であるかどうかを判定する。
func (i ID) IsZero() bool {
	return i.value == ""
}
