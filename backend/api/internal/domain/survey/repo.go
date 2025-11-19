package survey

import (
	"context"

	storeVO "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
)

type Repo interface {
	FindByStore(context.Context, storeVO.ID) ([]Survey, error)
}
