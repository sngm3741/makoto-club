package store

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// ErrInvalidBusinessHours は営業時間の形式が不正な場合に返される。
var ErrInvalidBusinessHours = errors.New("営業時間はHH:MM形式で入力してください（24時またぎ可、最大24時間）")

// BusinessHours は1日の営業時間を表す。
type BusinessHours struct {
	open  time.Duration
	close time.Duration
}

// NewBusinessHours は開始・終了時刻（HH:MM）を検証して値オブジェクトを生成する。
func NewBusinessHours(open, close string) (BusinessHours, error) {
	const day = 24 * time.Hour

	openMinutes, err := parseTimeToDuration(open)
	if err != nil {
		return BusinessHours{}, ErrInvalidBusinessHours
	}
	closeMinutes, err := parseTimeToDuration(close)
	if err != nil {
		return BusinessHours{}, ErrInvalidBusinessHours
	}
	// 24時またぎを許容する。終了が開始以前なら翌日に足す。
	if closeMinutes <= openMinutes {
		closeMinutes += day
	}
	// 開始と同じ、または24時間超は不正。
	if closeMinutes <= openMinutes || closeMinutes-openMinutes > day {
		return BusinessHours{}, ErrInvalidBusinessHours
	}
	return BusinessHours{
		open:  openMinutes,
		close: closeMinutes,
	}, nil
}

// OpenString は "HH:MM" 形式の開始時刻を返す。
func (b BusinessHours) OpenString() string {
	return formatDuration(b.open)
}

// CloseString は "HH:MM" 形式の終了時刻を返す。
func (b BusinessHours) CloseString() string {
	return formatDuration(b.close)
}

// Validate は営業時間が妥当かを判定する。
func (b BusinessHours) Validate() bool {
	const day = 24 * time.Hour
	return b.open >= 0 && b.close > b.open && b.close-b.open <= day
}

// IsZero は未設定かどうかを判定する。
func (b BusinessHours) IsZero() bool {
	return b.open == 0 && b.close == 0
}

func parseTimeToDuration(input string) (time.Duration, error) {
	trimmed := strings.TrimSpace(input)
	if len(trimmed) == 0 {
		return 0, ErrInvalidBusinessHours
	}
	parsed, err := time.Parse("15:04", trimmed)
	if err != nil {
		return 0, err
	}
	return time.Duration(parsed.Hour())*time.Hour + time.Duration(parsed.Minute())*time.Minute, nil
}

func formatDuration(d time.Duration) string {
	totalMinutes := int(d / time.Minute)
	hour := (totalMinutes / 60) % 24
	minute := totalMinutes % 60
	return fmt.Sprintf("%02d:%02d", hour, minute)
}
