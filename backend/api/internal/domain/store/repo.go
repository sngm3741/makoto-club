package store

type Repo interface {
	FindByID(string)
}
