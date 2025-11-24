COMPOSE ?= docker compose

ENV_DIR := env
ENVIRONMENT ?= production
DEV_ENV ?= local

# 絶対パスでenvファイルを渡す
SHARED_ENV := $(CURDIR)/$(ENV_DIR)/shared.env
env_file = $(CURDIR)/$(ENV_DIR)/$(1).env

compose = ENVIRONMENT=$(1) ENVIRONMENT_FILE=$(call env_file,$(1)) $(COMPOSE) --env-file $(SHARED_ENV) --env-file $(call env_file,$(1))

STACK := docker-compose.yml
DEV_STACK := docker-compose.dev.yml
EDGE_NETWORK ?= infra-edge-network
BACKEND_NETWORK ?= infra-backend-network
PROD_COMPOSE := $(call compose,$(ENVIRONMENT)) -f $(STACK)
DEV_COMPOSE := $(call compose,$(DEV_ENV)) -f $(STACK) -f $(DEV_STACK)

.PHONY: prod-up prod-down prod-restart prod-logs

prod-up: ensure-networks
	$(PROD_COMPOSE) up --build -d

prod-down:
	$(PROD_COMPOSE) down

prod-restart: prod-down prod-up

prod-logs:
	$(PROD_COMPOSE) logs -f

.PHONY: up down restart logs ps tidy network ensure-networks dev dev-down dev-logs

up: ensure-networks
	$(PROD_COMPOSE) up --build -d

down:
	$(PROD_COMPOSE) down

restart: down up

logs:
	$(PROD_COMPOSE) logs -f

ps:
	$(PROD_COMPOSE) ps

network: ensure-networks

ensure-networks:
	@for net in $(EDGE_NETWORK) $(BACKEND_NETWORK); do \
		if [ -n "$$net" ]; then \
			echo "Ensuring Docker network '$$net' exists..."; \
			docker network inspect $$net >/dev/null 2>&1 || docker network create $$net; \
		fi; \
	done

tidy:
	@if command -v go >/dev/null 2>&1; then \
		( cd api && GOCACHE=$$(pwd)/.gocache go mod tidy && rm -rf $$(pwd)/.gocache ); \
	else \
		docker run --rm -v $$(pwd)/api:/app -w /app golang:1.22 go mod tidy; \
	fi

dev: ensure-networks
	$(DEV_COMPOSE) up --build -d

dev-logs:
	$(DEV_COMPOSE) logs -f

dev-down:
	$(DEV_COMPOSE) down
