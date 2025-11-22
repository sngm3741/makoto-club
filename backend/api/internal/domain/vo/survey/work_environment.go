package survey

import (
	"errors"
	"strings"
	"unicode/utf8"
)

const maxWorkEnvironmentCommentLength = 2000

// ErrWorkEnvironmentCommentTooLong は職場環境コメントが制限を超えた場合に返される。
var ErrWorkEnvironmentCommentTooLong = errors.New("職場環境のコメントは2000文字以内で入力してください")

// WorkEnvironmentComment は職場環境に関するコメントを表す値オブジェクト。
type WorkEnvironmentComment struct {
	value string
}

// NewWorkEnvironmentComment はコメントを検証し、文字数制限を超えた場合はエラーを返す。
func NewWorkEnvironmentComment(input string) (WorkEnvironmentComment, error) {
	value, err := normalizeWorkEnvironmentComment(input)
	if err != nil {
		return WorkEnvironmentComment{}, err
	}
	return WorkEnvironmentComment{value: value}, nil
}

// String は内部値を返す。
func (c WorkEnvironmentComment) String() string {
	return c.value
}

// Value は内部値を文字列として返す。
func (c WorkEnvironmentComment) Value() string {
	return c.value
}

// Equals は別のコメントと一致するか判定する。
func (c WorkEnvironmentComment) Equals(other WorkEnvironmentComment) bool {
	return c.value == other.value
}

// Validate は文字数制限内かどうかを判定する。
func (c WorkEnvironmentComment) Validate() bool {
	_, err := normalizeWorkEnvironmentComment(c.value)
	return err == nil
}

// IsZero は未入力かどうかを判定する。
func (c WorkEnvironmentComment) IsZero() bool {
	return c.value == ""
}

func normalizeWorkEnvironmentComment(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if utf8.RuneCountInString(trimmed) > maxWorkEnvironmentCommentLength {
		return "", ErrWorkEnvironmentCommentTooLong
	}
	return trimmed, nil
}
