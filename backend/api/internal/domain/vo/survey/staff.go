package survey

import (
	"errors"
	"strings"
	"unicode/utf8"
)

const maxStaffCommentLength = 2000

// ErrStaffCommentTooLong はスタッフコメントが制限を超えた場合に返される。
var ErrStaffCommentTooLong = errors.New("スタッフに関するコメントは2000文字以内で入力してください")

// StaffComment はスタッフに関するコメントを表す値オブジェクト。
type StaffComment struct {
	value string
}

// NewStaffComment はコメントを検証し、文字数制限を超えた場合はエラーを返す。
func NewStaffComment(input string) (StaffComment, error) {
	value, err := normalizeStaffComment(input)
	if err != nil {
		return StaffComment{}, err
	}
	return StaffComment{value: value}, nil
}

// String は内部値を返す。
func (s StaffComment) String() string {
	return s.value
}

// Value は内部値を文字列として返す。
func (s StaffComment) Value() string {
	return s.value
}

// Equals は別のコメントと一致するか判定する。
func (s StaffComment) Equals(other StaffComment) bool {
	return s.value == other.value
}

// Validate は文字数制限内かどうかを判定する。
func (s StaffComment) Validate() bool {
	_, err := normalizeStaffComment(s.value)
	return err == nil
}

// IsZero は未入力かどうかを判定する。
func (s StaffComment) IsZero() bool {
	return s.value == ""
}

func normalizeStaffComment(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if utf8.RuneCountInString(trimmed) > maxStaffCommentLength {
		return "", ErrStaffCommentTooLong
	}
	return trimmed, nil
}
