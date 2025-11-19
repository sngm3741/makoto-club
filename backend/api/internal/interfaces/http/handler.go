package interfaces

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	store_vo "github.com/sngm3741/makoto-club-services/api/internal/domain/vo/store"
	survey_usecase "github.com/sngm3741/makoto-club-services/api/internal/usecase/survey"
)

type handler struct {
	surveyService survey_usecase.Service
}

type Handler interface {
	GetSurveysByStoreID(w http.ResponseWriter, r *http.Request)
}

func NewHandler(surveyService survey_usecase.Service) Handler {
	return &handler{surveyService: surveyService}
}

func (h *handler) GetSurveysByStoreID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	storeIDParam := chi.URLParam(r, "storeID")
	if storeIDParam == "" {
		http.Error(w, "storeID is required", http.StatusBadRequest)
		return
	}

	storeID := store_vo.NewID(storeIDParam)

	surveys, err := h.surveyService.GetByStoreID(ctx, storeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(surveys); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
