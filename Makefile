.PHONY: up down build rebuild api worker fe migrate seed logs reset sync-prod deploy lint typecheck test check

# Infrastructure
up:
	docker compose -f infra/docker-compose.yml --env-file .env up -d

down:
	docker compose -f infra/docker-compose.yml down

logs:
	docker compose -f infra/docker-compose.yml logs -f

build:
	docker compose -f infra/docker-compose.yml --env-file .env build

rebuild:
	docker compose -f infra/docker-compose.yml --env-file .env build --no-cache
	docker compose -f infra/docker-compose.yml --env-file .env up -d

reset:
	docker compose -f infra/docker-compose.yml down -v
	docker compose -f infra/docker-compose.yml --env-file .env up -d

# Backend
api:
	cd backend && uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

worker:
	cd backend && celery -A workers.celery_app worker --loglevel=info

migrate:
	@echo "TODO: alembic upgrade head"

seed:
	@echo "TODO: python scripts/seed.py"

# Frontend
fe:
	cd frontend && pnpm run dev

# Quality
lint:
	cd backend && ruff check . && ruff format --check .
	cd frontend && pnpm exec tsc --noEmit

typecheck:
	cd backend && mypy --ignore-missing-imports agents/ tools/ guardrails/

test:
	cd backend && python -m pytest tests/ -v --tb=short

check: lint test
	@echo "All checks passed"

# Production
sync-prod:
	@echo "TODO: sync prod config"

deploy:
	@echo "TODO: az containerapp deploy"
