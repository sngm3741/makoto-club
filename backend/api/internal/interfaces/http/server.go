package interfaces

import (
	"context"
	"net/http"
	"time"
)

// Server は HTTP サーバーのライフサイクル操作をラップする単純な構造体。
type Server struct {
	httpServer *http.Server
}

// NewServer はタイムアウト付きの http.Server を生成し、Server を返す。
func NewServer(addr string, handler http.Handler) *Server {
	return &Server{
		httpServer: &http.Server{
			Addr:         addr,
			Handler:      handler,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}
}

// ListenAndServe は内部 http.Server の ListenAndServe を呼び出す。
func (s *Server) ListenAndServe() error {
	return s.httpServer.ListenAndServe()
}

// Shutdown は指定したコンテキストで graceful shutdown を実行する。
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
