.PHONY: up down up-agents up-graph up-trace up-all down-all build rebuild api worker fe migrate seed logs reset lint typecheck test check check-auth sync-prod deploy

# ── Compose helpers ──────────────────────────────────────────────────────
DC       = docker compose --env-file .env
CORE     = -f infra/docker-compose.yml
AGENTS   = -f infra/docker-compose.agents.yml
GRAPH    = -f infra/docker-compose.graph.yml
TRACE    = -f infra/docker-compose.trace.yml
ALL      = $(CORE) $(AGENTS) $(GRAPH) $(TRACE)

# ── Infrastructure ───────────────────────────────────────────────────────
# Core only: traefik + postgres + redis + backend + frontend
up:
	$(DC) $(CORE) up -d

# Core + agent worker + LiteLLM
up-agents:
	$(DC) $(CORE) $(AGENTS) up -d

# Core + Memgraph + Memgraph Lab
up-graph:
	$(DC) $(CORE) $(GRAPH) up -d

# Core + Langfuse tracing
up-trace:
	$(DC) $(CORE) $(TRACE) up -d

# Everything
up-all:
	$(DC) $(ALL) up -d

down:
	$(DC) $(CORE) down

down-all:
	$(DC) $(ALL) down

logs:
	$(DC) $(CORE) logs -f

build:
	$(DC) $(CORE) build

rebuild:
	$(DC) $(CORE) build --no-cache
	$(DC) $(CORE) up -d

reset:
	$(DC) $(ALL) down -v
	$(DC) $(CORE) up -d

# ── Backend ──────────────────────────────────────────────────────────────
api:
	cd backend && uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

worker:
	cd backend && celery -A workers.celery_app worker --loglevel=info

migrate:
	@echo "Applying init.sql to running Postgres..."
	$(DC) $(CORE) exec -T postgres \
		psql -U $${POSTGRES_USER:-app} -d $${POSTGRES_DB:-agentfoundry} \
		< infra/init.sql
	@echo "Schema applied successfully."

seed:
	@echo "TODO: python scripts/seed.py"

# ── Frontend ─────────────────────────────────────────────────────────────
fe:
	@test -L frontend/.env || ln -sf ../.env frontend/.env
	cd frontend && pnpm run dev

# ── Quality ──────────────────────────────────────────────────────────────
lint:
	cd backend && ruff check . && ruff format --check .
	cd frontend && pnpm exec tsc --noEmit

typecheck:
	cd backend && mypy --ignore-missing-imports agents/ tools/ guardrails/

test:
	cd backend && python -m pytest tests/ -v --tb=short

check: lint test
	@echo "All checks passed"

check-auth:
	@bash scripts/check-auth.sh

# ── Production ───────────────────────────────────────────────────────────
sync-prod:
	@echo "TODO: sync prod config"

deploy:
	@echo "TODO: az containerapp deploy"
