package survey

import (
	"errors"
	"net/url"
	"strings"
)

// ErrEmptyImageURL は画像URLが空の場合に返される。
var ErrEmptyImageURL = errors.New("画像URLを入力してください")

// ErrInvalidImageURL はURL形式が不正な場合に返される。
var ErrInvalidImageURL = errors.New("画像URLの形式が不正です")

// ImageURL は単一の画像URLを表す値オブジェクト。
type ImageURL struct {
	value string
}

// NewImageURL は入力文字列を検証し、正規化した ImageURL を生成する。
// http/https スキームのみ許可する。
func NewImageURL(input string) (ImageURL, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return ImageURL{}, ErrEmptyImageURL
	}

	parsed, err := url.ParseRequestURI(trimmed)
	if err != nil {
		return ImageURL{}, ErrInvalidImageURL
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return ImageURL{}, ErrInvalidImageURL
	}

	return ImageURL{value: trimmed}, nil
}

// Value は内部文字列を返す。
func (u ImageURL) Value() string {
	return u.value
}

// String は内部値をそのまま返す。
func (u ImageURL) String() string {
	return u.value
}

// Equals は別の ImageURL と一致するか判定する。
func (u ImageURL) Equals(other ImageURL) bool {
	return u.value == other.value
}

// Validate は URL が適切かどうかを再度検証する。
func (u ImageURL) Validate() bool {
	if u.value == "" {
		return false
	}
	_, err := NewImageURL(u.value)
	return err == nil
}

// IsZero は未設定かどうかを判定する。
func (u ImageURL) IsZero() bool {
	return u.value == ""
}
