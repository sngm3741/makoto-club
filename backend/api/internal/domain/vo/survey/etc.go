package survey

import "strings"

// EtcComment は「その他」自由記述欄を表す値オブジェクト。
// バリデーションは行わず、入力をトリムして保持する。
type EtcComment struct {
	value string
}

// NewEtcComment はコメントを生成する。
func NewEtcComment(input string) (EtcComment, error) {
	return EtcComment{value: strings.TrimSpace(input)}, nil
}

// Value は内部値を返す。
func (c EtcComment) Value() string {
	return c.value
}

// Validate は常に true（バリデーションなし）。
func (c EtcComment) Validate() bool {
	return true
}

// IsZero は未入力かどうか判定する。
func (c EtcComment) IsZero() bool {
	return strings.TrimSpace(c.value) == ""
}
