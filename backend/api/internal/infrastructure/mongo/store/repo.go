package store

import (
	"context"
	"errors"
	"time"

	store_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/store"
	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var _ store_domain.Repo = (*Repo)(nil)

// Repo は MongoDB バックエンドの店舗リポジトリ。
type Repo struct {
	collection *mongo.Collection
}

// NewRepo は Mongo 用 StoreRepo を返す。
func NewRepo(col *mongo.Collection) *Repo {
	if col == nil {
		panic("mongo store repo: collection is nil")
	}
	return &Repo{collection: col}
}

func (r *Repo) Save(ctx context.Context, entity *store_domain.Store) error {
	if entity == nil {
		return errors.New("mongo store repo: store is nil")
	}

	doc, err := newDocument(entity)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": doc.ID}
	opts := options.Replace().SetUpsert(true)
	_, err = r.collection.ReplaceOne(ctx, filter, doc, opts)
	return err
}

func (r *Repo) FindByID(ctx context.Context, id store_vo.ID) (*store_domain.Store, error) {
	oid, err := primitive.ObjectIDFromHex(id.Value())
	if err != nil {
		return nil, err
	}
	filter := bson.M{"_id": oid, "deletedAt": bson.M{"$exists": false}}
	var doc document
	if err := r.collection.FindOne(ctx, filter).Decode(&doc); err != nil {
		return nil, err
	}
	return doc.toEntity()
}

func (r *Repo) FindByPrefecture(ctx context.Context, pref store_vo.Prefecture, page common_vo.Pagination) ([]*store_domain.Store, error) {
	filter := bson.M{"prefecture": pref.Value(), "deletedAt": bson.M{"$exists": false}}
	return r.findMany(ctx, filter, page)
}

func (r *Repo) FindByArea(ctx context.Context, area store_vo.Area, page common_vo.Pagination) ([]*store_domain.Store, error) {
	filter := bson.M{"area": area.Value(), "deletedAt": bson.M{"$exists": false}}
	return r.findMany(ctx, filter, page)
}

func (r *Repo) Delete(ctx context.Context, id store_vo.ID) error {
	oid, err := primitive.ObjectIDFromHex(id.Value())
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

func (r *Repo) findMany(ctx context.Context, filter bson.M, page common_vo.Pagination) ([]*store_domain.Store, error) {
	opts := options.Find().SetSort(bson.M{"createdAt": -1})
	if !page.IsZero() {
		opts.SetSkip(int64(page.Offset()))
		opts.SetLimit(int64(page.Limit()))
	}

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var docs []document
	if err := cursor.All(ctx, &docs); err != nil {
		return nil, err
	}

	stores := make([]*store_domain.Store, 0, len(docs))
	for _, doc := range docs {
		entity, err := doc.toEntity()
		if err != nil {
			return nil, err
		}
		stores = append(stores, entity)
	}
	return stores, nil
}

// Mongo ドキュメント構造
type document struct {
	ID            primitive.ObjectID     `bson:"_id"`
	Name          string                 `bson:"name"`
	BranchName    *string                `bson:"branchName,omitempty"`
	Prefecture    string                 `bson:"prefecture"`
	Area          *string                `bson:"area,omitempty"`
	Industry      string                 `bson:"industry"`
	Genre         *string                `bson:"genre,omitempty"`
	BusinessHours *businessHoursDocument `bson:"businessHours,omitempty"`
	AverageRating float64                `bson:"averageRating"`
	CreatedAt     time.Time              `bson:"createdAt"`
	UpdatedAt     time.Time              `bson:"updatedAt"`
	DeletedAt     *time.Time             `bson:"deletedAt,omitempty"`
}

type businessHoursDocument struct {
	Open  string `bson:"open"`
	Close string `bson:"close"`
}

func newDocument(entity *store_domain.Store) (*document, error) {
	oid, err := primitive.ObjectIDFromHex(entity.ID().Value())
	if err != nil {
		return nil, err
	}

	doc := &document{
		ID:            oid,
		Name:          entity.Name().Value(),
		Prefecture:    entity.Prefecture().Value(),
		Industry:      entity.Industry().Value(),
		AverageRating: entity.AverageRating().Value(),
		CreatedAt:     entity.CreatedAt().Value(),
		UpdatedAt:     entity.UpdatedAt().Value(),
	}

	if branch := entity.BranchName(); branch != nil {
		value := branch.Value()
		doc.BranchName = &value
	}
	if area := entity.Area(); area != nil {
		value := area.Value()
		doc.Area = &value
	}
	if genre := entity.Genre(); genre != nil {
		value := genre.Value()
		doc.Genre = &value
	}
	if hours := entity.BusinessHours(); hours != nil {
		doc.BusinessHours = &businessHoursDocument{
			Open:  hours.OpenString(),
			Close: hours.CloseString(),
		}
	}
	if deleted := entity.DeletedAt(); deleted != nil {
		value := deleted.Value()
		doc.DeletedAt = &value
	}

	return doc, nil
}

func (d *document) toEntity() (*store_domain.Store, error) {
	id, err := store_vo.NewID(d.ID.Hex())
	if err != nil {
		return nil, err
	}
	name, err := store_vo.NewName(d.Name)
	if err != nil {
		return nil, err
	}
	pref, err := store_vo.NewPrefecture(d.Prefecture)
	if err != nil {
		return nil, err
	}
	industry, err := store_vo.NewIndustry(d.Industry)
	if err != nil {
		return nil, err
	}

	opts := []store_domain.Option{}
	if d.BranchName != nil {
		opts = append(opts, store_domain.WithBranchName(store_vo.NewBranchName(*d.BranchName)))
	}
	if d.Area != nil {
		area, err := store_vo.NewArea(*d.Area)
		if err != nil {
			return nil, err
		}
		opts = append(opts, store_domain.WithArea(area))
	}
	if d.Genre != nil {
		genre, err := store_vo.NewGenre(*d.Genre)
		if err != nil {
			return nil, err
		}
		opts = append(opts, store_domain.WithGenre(genre))
	}
	if d.BusinessHours != nil {
		hours, err := store_vo.NewBusinessHours(d.BusinessHours.Open, d.BusinessHours.Close)
		if err != nil {
			return nil, err
		}
		opts = append(opts, store_domain.WithBusinessHours(hours))
	}
	avgRating, err := store_vo.NewAverageRating(d.AverageRating)
	if err != nil {
		return nil, err
	}
	opts = append(opts, store_domain.WithAverageRating(avgRating))

	createdAt, err := common_vo.NewTimestamp(d.CreatedAt)
	if err != nil {
		return nil, err
	}
	updatedAt, err := common_vo.NewTimestamp(d.UpdatedAt)
	if err != nil {
		return nil, err
	}
	opts = append(opts, store_domain.WithCreatedAt(createdAt), store_domain.WithUpdatedAt(updatedAt))
	if d.DeletedAt != nil {
		deletedAt, err := common_vo.NewTimestamp(*d.DeletedAt)
		if err != nil {
			return nil, err
		}
		opts = append(opts, store_domain.WithDeletedAt(deletedAt))
	}

	entity, err := store_domain.NewStore(id, name, pref, industry, opts...)
	if err != nil {
		return nil, err
	}
	return entity, nil
}
