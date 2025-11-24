package interfaces

import (
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

// DefaultMiddlewares は API 全体で使用するミドルウェア列を返す。
// CORS 設定を先頭に入れることで、OPTIONS リクエストを早期に処理する。
func DefaultMiddlewares(allowedOrigins []string) []func(http.Handler) http.Handler {
	return []func(http.Handler) http.Handler{
		corsMiddleware(allowedOrigins),
		middleware.RequestID,
		middleware.RealIP,
		middleware.Logger,
		middleware.Recoverer,
		middleware.Timeout(60 * time.Second),
	}
}

// corsMiddleware は許可されたオリジンのみアクセス可能にする HTTP ミドルウェアを返す。
// 許可されていないオリジンは JSON エラーで弾かれる。
func corsMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
	allowAll := len(allowedOrigins) == 0
	allowed := map[string]struct{}{}
	for _, origin := range allowedOrigins {
		trimmed := strings.TrimSpace(origin)
		if trimmed == "" {
			continue
		}
		if trimmed == "*" {
			allowAll = true
			allowed = nil
			break
		}
		allowed[trimmed] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin == "" {
				next.ServeHTTP(w, r)
				return
			}

			if allowAll {
				setCORSHeaders(w, "*")
			} else {
				if _, ok := allowed[origin]; !ok {
					respondError(w, http.StatusForbidden, "origin not allowed")
					return
				}
				setCORSHeaders(w, origin)
			}

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// setCORSHeaders は CORS 応答ヘッダーを一括で設定するヘルパー。
func setCORSHeaders(w http.ResponseWriter, origin string) {
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Vary", "Origin")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}
