package common

const (
	// DefaultPage は1ページ目
	DefaultPage = 1
	// DefaultLimit は1ページあたりのデフォルト件数
	DefaultLimit = 10
	// MaxLimit は1ページあたりの最大件数
	MaxLimit = 100
)

// Pagination は一覧取得時のページと件数を表す値オブジェクト。
type Pagination struct {
	page  int
	limit int
}

// NewPagination はページ・件数を正規化して Pagination を返す。
func NewPagination(page, limit int) Pagination {
	if page < DefaultPage {
		page = DefaultPage
	}
	if limit <= 0 {
		limit = DefaultLimit
	}
	if limit > MaxLimit {
		limit = MaxLimit
	}
	return Pagination{
		page:  page,
		limit: limit,
	}
}

// Page は現在のページ番号を返す。
func (p Pagination) Page() int {
	return p.page
}

// Limit は1ページあたりの件数を返す。
func (p Pagination) Limit() int {
	return p.limit
}

// Offset は Skip 件数を返す。
func (p Pagination) Offset() int {
	return (p.page - 1) * p.limit
}

// Validate はページとリミットが有効値かどうかを判定する。
func (p Pagination) Validate() bool {
	return p.page >= DefaultPage && p.limit > 0 && p.limit <= MaxLimit
}

// IsZero は未設定状態かを返す。
func (p Pagination) IsZero() bool {
	return p.page == 0 && p.limit == 0
}
