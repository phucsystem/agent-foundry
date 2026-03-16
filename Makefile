.PHONY: fe lint test check cdk-synth cdk-deploy cdk-deploy-foundation cdk-deploy-agentcore cdk-destroy cdk-bootstrap agent-dev agent-invoke agent-configure agent-launch migrate-aws gateway-dev

# ── Frontend ─────────────────────────────────────────────────────────
fe:
	@test -L frontend/.env || ln -sf ../.env frontend/.env
	cd frontend && pnpm run dev

# ── Gateway (local dev) ──────────────────────────────────────────────
gateway-dev:
	cd backend/gateway && uvicorn gateway.main:app --reload --host 0.0.0.0 --port 8000

# ── Quality ──────────────────────────────────────────────────────────
lint:
	cd backend && ruff check . && ruff format --check .
	cd frontend && pnpm exec tsc --noEmit

test:
	cd backend && python -m pytest tests/ -v --tb=short

check: lint test
	@echo "All checks passed"

# ── AWS CDK ──────────────────────────────────────────────────────────
cdk-synth:
	cd infra/cdk && cdk synth

cdk-deploy:
	cd infra/cdk && cdk deploy --all --require-approval broadening

cdk-deploy-foundation:
	cd infra/cdk && cdk deploy FoundationStack

cdk-deploy-agentcore:
	cd infra/cdk && cdk deploy AgentCoreStack

cdk-destroy:
	cd infra/cdk && cdk destroy --all

cdk-bootstrap:
	cd infra/cdk && cdk bootstrap

# ── AgentCore ────────────────────────────────────────────────────────
agent-dev:
	cd backend/agentcore && agentcore dev

agent-invoke:
	agentcore invoke '{"prompt": "hello", "context": {"brand_config_id": "test", "user_id": "test"}}'

agent-configure:
	cd backend/agentcore && agentcore configure -e main.py

agent-launch:
	cd backend/agentcore && agentcore launch

# ── Database Migrations ─────────────────────────────────────────────
migrate-aws:
	@echo "Run: psql $$DATABASE_URL < infra/migrations/001_initial_schema.sql"
