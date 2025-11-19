package common

import (
	"errors"
	"time"
)

// ErrZeroTimestamp はタイムスタンプが未設定の場合に返される。
var ErrZeroTimestamp = errors.New("時刻が指定されていません")

// Timestamp はUTCを基準とした時刻を表す。
type Timestamp struct {
	value time.Time
}

// NewTimestamp は時刻をUTCに正規化して値オブジェクトを生成する。
func NewTimestamp(t time.Time) (Timestamp, error) {
	if t.IsZero() {
		return Timestamp{}, ErrZeroTimestamp
	}
	return Timestamp{value: t.UTC()}, nil
}

// NowTimestamp は現在時刻を UTC として生成する。
func NowTimestamp() Timestamp {
	return Timestamp{value: time.Now().UTC()}
}

// Value は内部の time.Time を返す。
func (ts Timestamp) Value() time.Time {
	return ts.value
}

// Equals は別のタイムスタンプと一致するか判定する。
func (ts Timestamp) Equals(other Timestamp) bool {
	return ts.value.Equal(other.value)
}

// Validate は有効な時刻かどうかを判定する。
func (ts Timestamp) Validate() bool {
	return !ts.value.IsZero()
}

// IsZero は未設定かどうかを判定する。
func (ts Timestamp) IsZero() bool {
	return ts.value.IsZero()
}
