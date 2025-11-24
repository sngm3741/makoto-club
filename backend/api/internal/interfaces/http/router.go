// Package interfaces は HTTP 層のエントリポイントをまとめる。
package interfaces

import (
	"github.com/go-chi/chi/v5"
)

// NewRouter は共通ミドルウェアを適用した上で、Store/Survey のルートを組み立てる。
// allowedOrigins は CORS チェックに利用され、空の場合は全許可となる。
func NewRouter(handler Handler, allowedOrigins []string) chi.Router {
	r := chi.NewRouter()

	for _, mw := range DefaultMiddlewares(allowedOrigins) {
		r.Use(mw)
	}

	r.Route("/api", func(r chi.Router) {
		r.Route("/stores", func(r chi.Router) {
			r.Get("/", handler.ListStores)
			r.Route("/{storeID}", func(r chi.Router) {
				r.Get("/", handler.GetStoreByID)
				r.Get("/surveys", handler.GetSurveysByStoreID)
			})
		})

	r.Route("/surveys", func(r chi.Router) {
		r.Get("/", handler.ListSurveys)
		r.Post("/", handler.SubmitSurvey)
		r.Route("/{surveyID}", func(r chi.Router) {
			r.Get("/", handler.GetSurveyByID)
		})
	})

		r.Route("/admin", func(r chi.Router) {
			r.Route("/stores", func(r chi.Router) {
				r.Get("/", handler.ListAdminStores)
				r.Post("/", handler.CreateStore)
				r.Route("/{storeID}", func(r chi.Router) {
					r.Get("/", handler.GetStoreByID)
					r.Put("/", handler.UpdateStore)
					r.Delete("/", handler.DeleteStore)
				})
			})
			r.Route("/surveys", func(r chi.Router) {
				r.Get("/", handler.ListAdminSurveys)
				r.Post("/", handler.CreateSurvey)
				r.Route("/{surveyID}", func(r chi.Router) {
					r.Get("/", handler.GetAdminSurveyByID)
					r.Put("/", handler.UpdateSurvey)
					r.Delete("/", handler.DeleteSurvey)
				})
			})
		})
	})

	return r
}
