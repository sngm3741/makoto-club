package survey

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// ErrEmptyVisitedPeriod は稼働時期が未入力の場合に返される。
var ErrEmptyVisitedPeriod = errors.New("働いた時期を指定してください")

// ErrInvalidVisitedPeriod はフォーマットが不正な場合に返される。
var ErrInvalidVisitedPeriod = errors.New("働いた時期の形式が不正です")

// VisitedPeriod は稼働した年月を表す値オブジェクト。
type VisitedPeriod struct {
	value time.Time
}

// NewVisitedPeriod は "YYYY-MM" 形式の入力を検証し、値オブジェクトを生成する。
func NewVisitedPeriod(input string) (VisitedPeriod, error) {
	value := strings.TrimSpace(input)
	if value == "" {
		return VisitedPeriod{}, ErrEmptyVisitedPeriod
	}
	t, err := time.Parse("2006-01", value)
	if err != nil {
		return VisitedPeriod{}, ErrInvalidVisitedPeriod
	}
	return VisitedPeriod{value: t}, nil
}

// String は「YYYY年M月」の形式で返す。
func (p VisitedPeriod) String() string {
	if p.value.IsZero() {
		return ""
	}
	return fmt.Sprintf("%d年%d月", p.value.Year(), int(p.value.Month()))
}

// Value は time.Time を返す。
func (p VisitedPeriod) Value() time.Time {
	return p.value
}

// Year は年を返す。
func (p VisitedPeriod) Year() int {
	return p.value.Year()
}

// Month は月を返す。
func (p VisitedPeriod) Month() time.Month {
	return p.value.Month()
}

// Validate は値が設定されているかを判定する。
func (p VisitedPeriod) Validate() bool {
	return !p.value.IsZero()
}

// IsZero は未設定かどうかを判定する。
func (p VisitedPeriod) IsZero() bool {
	return p.value.IsZero()
}
