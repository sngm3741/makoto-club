package store

import (
	"context"
	"errors"
	"regexp"
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
// 集約の VO を Mongo ドキュメントへシリアライズ/デシリアライズする責務を持つ。
type Repo struct {
	collection       *mongo.Collection
	surveyCollection *mongo.Collection
}

// NewRepo は Mongo 用 StoreRepo を返す。
// NewRepo は MongoDB コレクションを受け取り、Repo を生成する。
// nil の場合は panic にしておくことで、DI ミスを早期に発見する。
func NewRepo(storeCol *mongo.Collection, surveyCol *mongo.Collection) *Repo {
	if storeCol == nil {
		panic("mongo store repo: collection is nil")
	}
	if surveyCol == nil {
		panic("mongo store repo: survey collection is nil")
	}
	return &Repo{collection: storeCol, surveyCollection: surveyCol}
}

// Save は Store 集約を _id 指定で置換する（Upsert）。
// 時刻や optional フィールドは newDocument 内で適切に marshaling される。
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

// FindByID は ObjectID を使って単一店舗を検索する。
// ソフトデリートされたドキュメントは除外する。
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

// FindByPrefecture は都道府県単位で店舗一覧を取得する。
// ページング情報は Offset/Limit に変換して Find オプションへ渡される。
func (r *Repo) FindByPrefecture(ctx context.Context, pref store_vo.Prefecture, page common_vo.Pagination) ([]*store_domain.Store, error) {
	filter := bson.M{"prefecture": pref.Value(), "deletedAt": bson.M{"$exists": false}}
	return r.findMany(ctx, filter, page)
}

// FindByArea はエリア単位で店舗一覧を取得する。
func (r *Repo) FindByArea(ctx context.Context, area store_vo.Area, page common_vo.Pagination) ([]*store_domain.Store, error) {
	filter := bson.M{"area": area.Value(), "deletedAt": bson.M{"$exists": false}}
	return r.findMany(ctx, filter, page)
}

// Search は任意条件で店舗を取得する。件数とセットで返す。
func (r *Repo) Search(ctx context.Context, filter store_domain.SearchFilter, sort common_vo.SortKey, page common_vo.Pagination) ([]*store_domain.Store, int64, error) {
	mongoFilter := bson.M{"deletedAt": bson.M{"$exists": false}}
	if filter.Prefecture != nil {
		mongoFilter["prefecture"] = filter.Prefecture.Value()
	}
	if filter.Area != nil {
		mongoFilter["area"] = filter.Area.Value()
	}
	if filter.Industry != nil {
		mongoFilter["industry"] = filter.Industry.Value()
	}
	if filter.Genre != nil {
		mongoFilter["genre"] = filter.Genre.Value()
	}
	if filter.NameKeyword != "" {
		pattern := regexp.QuoteMeta(filter.NameKeyword)
		regex := primitive.Regex{Pattern: pattern, Options: "i"}
		mongoFilter["$or"] = []bson.M{
			{"name": regex},
			{"branchName": regex},
		}
	}

	total, err := r.collection.CountDocuments(ctx, mongoFilter)
	if err != nil {
		return nil, 0, err
	}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: mongoFilter}},
		{
			{Key: "$lookup", Value: bson.D{
				{Key: "from", Value: r.surveyCollection.Name()},
				{Key: "let", Value: bson.D{{Key: "storeId", Value: "$_id"}}},
				{Key: "pipeline", Value: mongo.Pipeline{
					{{Key: "$match", Value: bson.D{
						{Key: "$expr", Value: bson.D{{Key: "$eq", Value: bson.A{"$storeId", "$$storeId"}}}},
						{Key: "deletedAt", Value: bson.D{{Key: "$exists", Value: false}}},
					}}},
				}},
				{Key: "as", Value: "surveys"},
			}},
		},
		{
			{Key: "$addFields", Value: bson.D{
				{Key: "surveyCount", Value: bson.D{{Key: "$size", Value: "$surveys"}}},
				{Key: "helpfulCount", Value: bson.D{{Key: "$sum", Value: "$surveys.helpfulCount"}}},
				{Key: "averageEarningAgg", Value: bson.D{
					{Key: "$cond", Value: bson.A{
						bson.D{{Key: "$gt", Value: bson.A{bson.D{{Key: "$size", Value: "$surveys"}}, 0}}},
						bson.D{{Key: "$avg", Value: "$surveys.averageEarning"}},
						0,
					}},
				}},
			}},
		},
		{{Key: "$project", Value: bson.D{{Key: "surveys", Value: 0}}}},
	}

	pipeline = append(pipeline, bson.D{{Key: "$sort", Value: buildSort(sort)}})

	if !page.IsZero() {
		pipeline = append(pipeline,
			bson.D{{Key: "$skip", Value: int64(page.Offset())}},
			bson.D{{Key: "$limit", Value: int64(page.Limit())}},
		)
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var docs []document
	if err := cursor.All(ctx, &docs); err != nil {
		return nil, 0, err
	}

	stores := make([]*store_domain.Store, 0, len(docs))
	for _, doc := range docs {
		entity, err := doc.toEntity()
		if err != nil {
			return nil, 0, err
		}
		stores = append(stores, entity)
	}

	return stores, total, nil
}

// Delete は物理削除を行う。論理削除が欲しい場合は Usecase 側で DeletedAt を設定する。
func (r *Repo) Delete(ctx context.Context, id store_vo.ID) error {
	oid, err := primitive.ObjectIDFromHex(id.Value())
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

// findMany は共有の検索ロジック。フィルター + ページングでカーソルを走査し、VO に復元する。
// 途中で VO 生成に失敗した場合はそのままエラーを返して早期終了する。
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
		branch, err := store_vo.NewBranchName(*d.BranchName)
		if err != nil {
			return nil, err
		}
		opts = append(opts, store_domain.WithBranchName(branch))
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
	if d.BusinessHours != nil && d.BusinessHours.Open != "" && d.BusinessHours.Close != "" {
		if hours, err := store_vo.NewBusinessHours(d.BusinessHours.Open, d.BusinessHours.Close); err == nil {
			opts = append(opts, store_domain.WithBusinessHours(hours))
		}
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

func buildSort(sortKey common_vo.SortKey) bson.D {
	switch sortKey.Value() {
	case common_vo.SortHelpful:
		return bson.D{{Key: "helpfulCount", Value: -1}, {Key: "updatedAt", Value: -1}}
	case common_vo.SortEarning:
		return bson.D{{Key: "averageEarningAgg", Value: -1}, {Key: "updatedAt", Value: -1}}
	default:
		return bson.D{{Key: "updatedAt", Value: -1}}
	}
}
