package survey

import (
	"errors"
	"strings"
	"unicode/utf8"
)

const maxCustomerCommentLength = 2000

// ErrCustomerCommentTooLong は客層に関するコメントが制限を超えた場合に返される。
var ErrCustomerCommentTooLong = errors.New("客層のコメントは2000文字以内で入力してください")

// CustomerComment は客層に関するコメントを表す値オブジェクト。
// 2000 文字上限を超えるとエラーになる。
type CustomerComment struct {
	value string
}

// NewCustomerComment はコメントを検証し、文字数制限を超えた場合はエラーを返す。
func NewCustomerComment(input string) (CustomerComment, error) {
	value, err := normalizeCustomerComment(input)
	if err != nil {
		return CustomerComment{}, err
	}
	return CustomerComment{value: value}, nil
}

// String は内部値を返す。
func (c CustomerComment) String() string {
	return c.value
}

// Value は内部値を文字列として返す。
func (c CustomerComment) Value() string {
	return c.value
}

// Equals は別のコメントと一致するか判定する。
func (c CustomerComment) Equals(other CustomerComment) bool {
	return c.value == other.value
}

// Validate は文字数制限内かどうかを判定する。
func (c CustomerComment) Validate() bool {
	_, err := normalizeCustomerComment(c.value)
	return err == nil
}

// IsZero は未入力かどうかを判定する。
func (c CustomerComment) IsZero() bool {
	return c.value == ""
}

func normalizeCustomerComment(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if utf8.RuneCountInString(trimmed) > maxCustomerCommentLength {
		return "", ErrCustomerCommentTooLong
	}
	return trimmed, nil
}
