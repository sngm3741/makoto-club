package interfaces

import (
	"github.com/go-chi/chi/v5"
)

func NewRouter(handler Handler) chi.Router {
	r := chi.NewRouter()

	for _, mw := range DefaultMiddlewares() {
		r.Use(mw)
	}

	r.Route("/stores/{storeID}", func(r chi.Router) {
		r.Get("/surveys", handler.GetSurveysByStoreID)
	})

	return r
}
