package survey

import (
	"errors"
	"regexp"
	"strings"
)

var (
	emailRegexp         = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	ErrInvalidEmail     = errors.New("メールアドレスの形式が不正です")
	ErrEmailTooLong     = errors.New("メールアドレスは256文字以内で入力してください")
	maxEmailLength  int = 256
)

// EmailAddress は任意入力のメールアドレスを表す。
type EmailAddress struct {
	value string
}

// NewEmailAddress は入力文字列を検証し、空文字ならゼロ値を返す。
func NewEmailAddress(value string) (EmailAddress, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return EmailAddress{}, nil
	}
	if len(trimmed) > maxEmailLength {
		return EmailAddress{}, ErrEmailTooLong
	}
	if !emailRegexp.MatchString(trimmed) {
		return EmailAddress{}, ErrInvalidEmail
	}
	return EmailAddress{value: trimmed}, nil
}

// Value は内部文字列を返す。
func (e EmailAddress) Value() string {
	return e.value
}

// IsZero は未入力かどうか。
func (e EmailAddress) IsZero() bool {
	return e.value == ""
}

// Validate は現在の状態が有効か判定する。
func (e EmailAddress) Validate() bool {
	if e.IsZero() {
		return true
	}
	if len(e.value) > maxEmailLength {
		return false
	}
	return emailRegexp.MatchString(e.value)
}
