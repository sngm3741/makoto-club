package common

import (
	"errors"
	"strings"
)

const (
	// SortNewest は最新順
	SortNewest = "newest"
	// SortHelpful は役立ち度順
	SortHelpful = "helpful"
	// SortEarning は平均稼ぎ順
	SortEarning = "earning"
)

var (
	// ErrInvalidSortKey は許可されていないソートキーが指定された場合に返される。
	ErrInvalidSortKey = errors.New("サポートされていないソートキーです")

	allowedSortKeys = map[string]struct{}{
		SortNewest:  {},
		SortHelpful: {},
		SortEarning: {},
	}
)

// SortKey は検索時の並び替え方法を表す値オブジェクト。
type SortKey struct {
	value string
}

// NewSortKey は入力文字列を正規化した上で、許可されたソートキーのみ生成する。
// 空文字の場合は最新版 (newest) をデフォルトとする。
func NewSortKey(input string) (SortKey, error) {
	sanitized := strings.TrimSpace(strings.ToLower(input))
	if sanitized == "" {
		return SortKey{value: SortNewest}, nil
	}
	if _, ok := allowedSortKeys[sanitized]; !ok {
		return SortKey{}, ErrInvalidSortKey
	}
	return SortKey{value: sanitized}, nil
}

// String は内部値を返す。
func (s SortKey) String() string {
	return s.value
}

// Value は内部値を文字列として返す。
func (s SortKey) Value() string {
	return s.value
}

// Equals は別の SortKey と一致するか判定する。
func (s SortKey) Equals(other SortKey) bool {
	return s.value == other.value
}

// Validate は内部値が許可されたキーかを判定する。
func (s SortKey) Validate() bool {
	_, ok := allowedSortKeys[s.value]
	return ok
}

// IsZero は未設定であるかどうかを判定する。
func (s SortKey) IsZero() bool {
	return s.value == ""
}
