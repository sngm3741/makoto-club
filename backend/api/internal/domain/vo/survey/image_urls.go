package survey

import "errors"

const (
	// MaxImageURLs は登録できる画像の最大枚数
	MaxImageURLs = 10
)

// ErrTooManyImageURLs は許可枚数を超えた場合に返される。
var ErrTooManyImageURLs = errors.New("画像は10件まで登録できます")

// ImageURLs は画像URLの集合を表す値オブジェクト。
type ImageURLs struct {
	values []ImageURL
}

// NewImageURLs は文字列のスライスを検証し、ImageURLs を生成する。
func NewImageURLs(inputs []string) (ImageURLs, error) {
	if len(inputs) > MaxImageURLs {
		return ImageURLs{}, ErrTooManyImageURLs
	}

	urls := make([]ImageURL, 0, len(inputs))
	for _, raw := range inputs {
		urlVO, err := NewImageURL(raw)
		if err != nil {
			return ImageURLs{}, err
		}
		urls = append(urls, urlVO)
	}

	return ImageURLs{values: urls}, nil
}

// Values は ImageURL のスライスを返す。
func (i ImageURLs) Values() []ImageURL {
	copied := make([]ImageURL, len(i.values))
	copy(copied, i.values)
	return copied
}

// Strings はプレーンな文字列スライスを返す。
func (i ImageURLs) Strings() []string {
	result := make([]string, len(i.values))
	for idx, url := range i.values {
		result[idx] = url.Value()
	}
	return result
}

// Len は保持している画像枚数を返す。
func (i ImageURLs) Len() int {
	return len(i.values)
}

// Validate は各要素が有効であり、上限以内かを判定する。
func (i ImageURLs) Validate() bool {
	if len(i.values) > MaxImageURLs {
		return false
	}
	for _, url := range i.values {
		if !url.Validate() {
			return false
		}
	}
	return true
}

// IsZero は画像が一件も登録されていないかを判定する。
func (i ImageURLs) IsZero() bool {
	return len(i.values) == 0
}
