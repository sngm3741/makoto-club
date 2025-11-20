package survey

import (
	"context"
	"errors"
	"time"

	survey_domain "github.com/sngm3741/makoto-club-services/api/internal/domain/survey"
	common_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/common"
	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	survey_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/survey"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var _ survey_domain.Repo = (*Repo)(nil)

// Repo は MongoDB バックエンドのアンケートリポジトリ。
type Repo struct {
	collection *mongo.Collection
}

// NewRepo は SurveyRepo を返す。
func NewRepo(col *mongo.Collection) *Repo {
	if col == nil {
		panic("mongo survey repo: collection is nil")
	}
	return &Repo{collection: col}
}

func (r *Repo) Save(ctx context.Context, entity *survey_domain.Survey) error {
	if entity == nil {
		return errors.New("mongo survey repo: survey is nil")
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

func (r *Repo) FindByID(ctx context.Context, id survey_vo.ID) (*survey_domain.Survey, error) {
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

func (r *Repo) FindByStore(ctx context.Context, storeID store_vo.ID, page common_vo.Pagination) ([]*survey_domain.Survey, error) {
	oid, err := primitive.ObjectIDFromHex(storeID.Value())
	if err != nil {
		return nil, err
	}
	filter := bson.M{"storeId": oid, "deletedAt": bson.M{"$exists": false}}
	return r.findMany(ctx, filter, page)
}

func (r *Repo) FindByPrefecture(ctx context.Context, pref store_vo.Prefecture, page common_vo.Pagination) ([]*survey_domain.Survey, error) {
	filter := bson.M{"storePrefecture": pref.Value(), "deletedAt": bson.M{"$exists": false}}
	return r.findMany(ctx, filter, page)
}

func (r *Repo) Delete(ctx context.Context, id survey_vo.ID) error {
	oid, err := primitive.ObjectIDFromHex(id.Value())
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": oid})
	return err
}

func (r *Repo) findMany(ctx context.Context, filter bson.M, page common_vo.Pagination) ([]*survey_domain.Survey, error) {
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

	surveys := make([]*survey_domain.Survey, 0, len(docs))
	for _, doc := range docs {
		entity, err := doc.toEntity()
		if err != nil {
			return nil, err
		}
		surveys = append(surveys, entity)
	}
	return surveys, nil
}

// survey ドキュメント構造
type document struct {
	ID                     primitive.ObjectID `bson:"_id"`
	StoreID                primitive.ObjectID `bson:"storeId"`
	StoreName              string             `bson:"storeName"`
	StoreBranchName        *string            `bson:"storeBranchName,omitempty"`
	StorePrefecture        string             `bson:"storePrefecture"`
	StoreArea              *string            `bson:"storeArea,omitempty"`
	StoreIndustry          string             `bson:"storeIndustry"`
	StoreGenre             *string            `bson:"storeGenre,omitempty"`
	VisitedPeriod          string             `bson:"visitedPeriod"`
	WorkType               string             `bson:"workType"`
	Age                    int                `bson:"age"`
	SpecScore              int                `bson:"specScore"`
	WaitTimeHours          int                `bson:"waitTimeHours"`
	AverageEarning         int                `bson:"averageEarning"`
	Rating                 float64            `bson:"rating"`
	CustomerComment        *string            `bson:"customerComment,omitempty"`
	StaffComment           *string            `bson:"staffComment,omitempty"`
	WorkEnvironmentComment *string            `bson:"workEnvironmentComment,omitempty"`
	CreatedAt              time.Time          `bson:"createdAt"`
	UpdatedAt              time.Time          `bson:"updatedAt"`
	DeletedAt              *time.Time         `bson:"deletedAt,omitempty"`
}

func newDocument(entity *survey_domain.Survey) (*document, error) {
	id, err := primitive.ObjectIDFromHex(entity.ID().Value())
	if err != nil {
		return nil, err
	}
	storeID, err := primitive.ObjectIDFromHex(entity.StoreID().Value())
	if err != nil {
		return nil, err
	}

	doc := &document{
		ID:              id,
		StoreID:         storeID,
		StoreName:       entity.StoreName().Value(),
		StorePrefecture: entity.StorePrefecture().Value(),
		StoreIndustry:   entity.StoreIndustry().Value(),
		VisitedPeriod:   entity.VisitedPeriod().Value().Format("2006-01"),
		WorkType:        entity.WorkType().Value(),
		Age:             entity.Age().Value(),
		SpecScore:       entity.SpecScore().Value(),
		WaitTimeHours:   entity.WaitTime().Value(),
		AverageEarning:  entity.AverageEarning().Value(),
		Rating:          entity.Rating().Value(),
		CreatedAt:       entity.CreatedAt().Value(),
		UpdatedAt:       entity.UpdatedAt().Value(),
	}

	if branch := entity.StoreBranch(); branch != nil {
		value := branch.Value()
		doc.StoreBranchName = &value
	}
	if area := entity.StoreArea(); area != nil {
		value := area.Value()
		doc.StoreArea = &value
	}
	if genre := entity.StoreGenre(); genre != nil {
		value := genre.Value()
		doc.StoreGenre = &value
	}
	if v := entity.CustomerComment(); v != nil {
		value := v.Value()
		doc.CustomerComment = &value
	}
	if v := entity.StaffComment(); v != nil {
		value := v.Value()
		doc.StaffComment = &value
	}
	if v := entity.WorkEnvironmentComment(); v != nil {
		value := v.Value()
		doc.WorkEnvironmentComment = &value
	}
	if deleted := entity.DeletedAt(); deleted != nil {
		value := deleted.Value()
		doc.DeletedAt = &value
	}

	return doc, nil
}

func (d *document) toEntity() (*survey_domain.Survey, error) {
	id, err := survey_vo.NewID(d.ID.Hex())
	if err != nil {
		return nil, err
	}
	storeID, err := store_vo.NewID(d.StoreID.Hex())
	if err != nil {
		return nil, err
	}
	storeName, err := store_vo.NewName(d.StoreName)
	if err != nil {
		return nil, err
	}
	pref, err := store_vo.NewPrefecture(d.StorePrefecture)
	if err != nil {
		return nil, err
	}
	industry, err := store_vo.NewIndustry(d.StoreIndustry)
	if err != nil {
		return nil, err
	}
	visited, err := survey_vo.NewVisitedPeriod(d.VisitedPeriod)
	if err != nil {
		return nil, err
	}
	workType, err := survey_vo.NewWorkType(d.WorkType)
	if err != nil {
		return nil, err
	}
	age, err := survey_vo.NewAge(d.Age)
	if err != nil {
		return nil, err
	}
	spec, err := survey_vo.NewSpecScore(d.SpecScore)
	if err != nil {
		return nil, err
	}
	wait, err := survey_vo.NewWaitTimeHours(d.WaitTimeHours)
	if err != nil {
		return nil, err
	}
	earning, err := survey_vo.NewAverageEarning(d.AverageEarning)
	if err != nil {
		return nil, err
	}
	rating, err := survey_vo.NewRating(d.Rating)
	if err != nil {
		return nil, err
	}

	opts := []survey_domain.Option{}
	if d.StoreBranchName != nil {
		opts = append(opts, survey_domain.WithStoreBranch(store_vo.NewBranchName(*d.StoreBranchName)))
	}
	if d.StoreArea != nil {
		area, err := store_vo.NewArea(*d.StoreArea)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithStoreArea(area))
	}
	if d.StoreGenre != nil {
		genre, err := store_vo.NewGenre(*d.StoreGenre)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithStoreGenre(genre))
	}
	if d.CustomerComment != nil {
		c, err := survey_vo.NewCustomerComment(*d.CustomerComment)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithCustomerComment(c))
	}
	if d.StaffComment != nil {
		c, err := survey_vo.NewStaffComment(*d.StaffComment)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithStaffComment(c))
	}
	if d.WorkEnvironmentComment != nil {
		c, err := survey_vo.NewWorkEnvironmentComment(*d.WorkEnvironmentComment)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithWorkEnvironmentComment(c))
	}

	createdAt, err := common_vo.NewTimestamp(d.CreatedAt)
	if err != nil {
		return nil, err
	}
	updatedAt, err := common_vo.NewTimestamp(d.UpdatedAt)
	if err != nil {
		return nil, err
	}
	opts = append(opts, survey_domain.WithSurveyTimestamps(createdAt, updatedAt))
	if d.DeletedAt != nil {
		deleted, err := common_vo.NewTimestamp(*d.DeletedAt)
		if err != nil {
			return nil, err
		}
		opts = append(opts, survey_domain.WithSurveyDeletedAt(deleted))
	}

	entity, err := survey_domain.NewSurvey(
		id,
		storeID,
		storeName,
		pref,
		industry,
		visited,
		workType,
		age,
		spec,
		wait,
		earning,
		rating,
		opts...,
	)
	if err != nil {
		return nil, err
	}
	return entity, nil
}
