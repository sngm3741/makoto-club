// Package main は API サーバーのエントリポイントを提供する。
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	store_mongo "github.com/sngm3741/makoto-club-services/api/internal/infrastructure/mongo/store"
	survey_mongo "github.com/sngm3741/makoto-club-services/api/internal/infrastructure/mongo/survey"
	interfaces_http "github.com/sngm3741/makoto-club-services/api/internal/interfaces/http"
	store_usecase "github.com/sngm3741/makoto-club-services/api/internal/usecase/store"
	survey_usecase "github.com/sngm3741/makoto-club-services/api/internal/usecase/survey"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// config はアプリ起動時に必要な設定値をまとめた構造体。
// 環境変数から値を読み取り、欠けている場合は合理的なデフォルトを採用する。
type config struct {
	addr             string
	mongoURI         string
	mongoDatabase    string
	storeCollection  string
	surveyCollection string
	connectTimeout   time.Duration
	shutdownTimeout  time.Duration
	allowedOrigins   []string
	logger           *log.Logger
}

// main は MongoDB との接続、DI、HTTP サーバーの起動/終了処理を行う。
func main() {
	c := loadConfig()

	ctx, cancel := context.WithTimeout(context.Background(), c.connectTimeout)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(c.mongoURI))
	if err != nil {
		c.logger.Fatalf("failed to connect to MongoDB: %v", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		c.logger.Fatalf("failed to ping MongoDB: %v", err)
	}

	database := client.Database(c.mongoDatabase)
	storeRepo := store_mongo.NewRepo(
		database.Collection(c.storeCollection),
		database.Collection(c.surveyCollection),
	)
	storeService := store_usecase.NewService(storeRepo)

	surveyRepo := survey_mongo.NewRepo(database.Collection(c.surveyCollection))
	surveyService := survey_usecase.NewService(surveyRepo)

	handler := interfaces_http.NewHandler(storeService, surveyService)
	router := interfaces_http.NewRouter(handler, c.allowedOrigins)
	srv := interfaces_http.NewServer(c.addr, router)

	serverErrors := make(chan error, 1)
	go func() {
		c.logger.Printf("HTTP server listening on %s", c.addr)
		serverErrors <- srv.ListenAndServe()
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(sigCh)

	select {
	case err := <-serverErrors:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			c.logger.Fatalf("server error: %v", err)
		}
	case sig := <-sigCh:
		c.logger.Printf("received signal %s, shutting down", sig)
		shutdownCtx, cancel := context.WithTimeout(context.Background(), c.shutdownTimeout)
		if err := srv.Shutdown(shutdownCtx); err != nil {
			c.logger.Printf("graceful shutdown failed: %v", err)
		}
		cancel()
		if err := <-serverErrors; err != nil && !errors.Is(err, http.ErrServerClosed) {
			c.logger.Printf("server returned error: %v", err)
		}
	}

	disconnectCtx, cancel := context.WithTimeout(context.Background(), c.shutdownTimeout)
	defer cancel()
	if err := client.Disconnect(disconnectCtx); err != nil {
		c.logger.Printf("MongoDB disconnect error: %v", err)
	}
}

// loadConfig は環境変数を読み込み、アプリケーション設定を生成する。
// 文字列/リスト/Duration のパースは補助関数に委譲している。
func loadConfig() config {
	logger := log.New(os.Stdout, "[makoto-club-api] ", log.LstdFlags|log.Lshortfile)

	surveyCollection := strings.TrimSpace(os.Getenv("SURVEY_COLLECTION"))
	if surveyCollection == "" {
		surveyCollection = "surveys"
	}

	return config{
		addr:             envOrDefault("HTTP_ADDR", ":8080"),
		mongoURI:         envOrDefault("MONGO_URI", "mongodb://mongo:27017"),
		mongoDatabase:    envOrDefault("MONGO_DB", "makoto-club"),
		storeCollection:  envOrDefault("STORE_COLLECTION", "stores"),
		surveyCollection: surveyCollection,
		connectTimeout:   durationFromEnv("MONGO_CONNECT_TIMEOUT", 10*time.Second),
		shutdownTimeout:  durationFromEnv("HTTP_SHUTDOWN_TIMEOUT", 15*time.Second),
		allowedOrigins:   listFromEnv("HTTP_ALLOWED_ORIGINS", []string{"*"}),
		logger:           logger,
	}
}

// envOrDefault は指定した環境変数を取得し、空の場合はデフォルト値を返す。
func envOrDefault(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

// durationFromEnv は環境変数を time.ParseDuration で解釈し、失敗時にデフォルトを返す。
func durationFromEnv(key string, fallback time.Duration) time.Duration {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}

	if d, err := time.ParseDuration(raw); err == nil {
		return d
	}

	return fallback
}

// listFromEnv はカンマ区切り文字列をスライスに変換し、空ならデフォルトを返す。
func listFromEnv(key string, fallback []string) []string {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	parts := strings.Split(raw, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			values = append(values, trimmed)
		}
	}
	if len(values) == 0 {
		return fallback
	}
	return values
}
