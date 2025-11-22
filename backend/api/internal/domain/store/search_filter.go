package store

import store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"

// SearchFilter は管理画面向けの店舗検索条件を表す。
type SearchFilter struct {
	Prefecture  *store_vo.Prefecture
	Area        *store_vo.Area
	Industry    *store_vo.Industry
	Genre       *store_vo.Genre
	NameKeyword string
}
