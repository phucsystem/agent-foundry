.PHONY: up down api worker fe migrate seed logs reset sync-prod deploy

# Infrastructure
up:
	docker compose -f infra/docker-compose.yml --env-file .env up -d

down:
	docker compose -f infra/docker-compose.yml down

logs:
	docker compose -f infra/docker-compose.yml logs -f

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

# Production
sync-prod:
	@echo "TODO: sync prod config"

deploy:
	@echo "TODO: az containerapp deploy"
