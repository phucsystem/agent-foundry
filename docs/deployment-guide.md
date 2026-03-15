# Deployment Guide

## Overview

Agent-foundry deploys to Azure using container-based infrastructure as code (Bicep). Environments: dev (local), staging (Azure), production (Azure with higher scale/SLAs).

---

## Prerequisites

### Local Development
- Python 3.11+
- Node.js 18+
- Docker, Docker Compose
- Git
- `.env` file (copy from `.env.example`)

### Azure Deployment
- Azure CLI (`az login`)
- Azure subscription with budget allocation
- Storage account for Terraform state (or use local state)
- Container Registry (ACR) for image storage
- Bicep CLI (included in latest Azure CLI)

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourorg/agent-foundry.git
cd agent-foundry
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-dev.txt

# Copy environment template
cp .env.example .env
# Edit .env with local settings (leave defaults for local dev)

# Run migrations
alembic upgrade head

# Start local stack
docker-compose up -d

# Run tests
pytest tests/ -v --cov=src

# Start FastAPI server
uvicorn src.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment
cp .env.example .env.local

# Type check
npm run lint

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Start dev server
npm run dev
```

### 4. Verify Everything
- Backend: http://localhost:8000/docs (Swagger)
- Frontend: http://localhost:3000 (via Traefik: http://app.localhost)
- Database: PostgreSQL on localhost:5432
- Redis: localhost:6379
- Memgraph: localhost:7687 (via Traefik: http://mglab.localhost)
- LiteLLM: http://localhost:4000 (via Traefik: http://litellm.localhost)
- Langfuse: http://localhost:3200 (via Traefik: http://langfuse.localhost)

---

## Docker Compose (Local Stack)

### Configuration (`docker-compose.yml`)
10 Services (complete platform):
1. **traefik** — Reverse proxy (v3) with service discovery
2. **postgres** — PostgreSQL 16 with pgvector extension (persistent volumes)
3. **redis** — Redis 7 (task queue + session cache)
4. **memgraph** — Memgraph (relational graph DB, evaluate Phase 3)
5. **memgraph-lab** — Memgraph Lab UI (explore graph data)
6. **litellm** — LiteLLM proxy (model routing + fallback logic)
7. **backend** — FastAPI application server (port 8000)
8. **worker** — Celery async task executor (no exposed port)
9. **frontend** — Next.js development server (port 3000)
10. **langfuse** — LLM tracing & observability (port 3200)

### Commands
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f fastapi

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up
```

### Volumes
- `postgres_data/` — PostgreSQL data
- `redis_data/` — Redis persistence (optional)

---

## Environment Variables

### Backend (`.env`)
```bash
# Database
DATABASE_URL=postgresql+asyncpg://app:changeme@postgres:5432/agentfoundry
REDIS_URL=redis://redis:6379/0
MEMGRAPH_URL=bolt://memgraph:7687

# LLM APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=...
OPENAI_API_KEY=...
DEEPSEEK_API_KEY=...

# LiteLLM
LITELLM_BASE_URL=http://litellm:4000/v1
LITELLM_MASTER_KEY=changeme

# Logto Cloud Auth (OIDC)
LOGTO_ENDPOINT=https://pk5k15.logto.app/
LOGTO_APP_ID=wfys39gnwrpez0g29f1v0
LOGTO_API_RESOURCE=http://localhost:8000
JWT_SECRET_KEY=dev-secret-change-in-production-32ch

# Observability
LANGFUSE_PUBLIC_KEY=...
LANGFUSE_SECRET_KEY=...
LANGFUSE_HOST=http://langfuse:3000

# Application
DEBUG=True
LOG_LEVEL=INFO
ENVIRONMENT=development

# Auth Bypass (development only)
MOCK_AUTH=false  # Set true to skip Logto validation
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development

# Logto Cloud Auth (OIDC)
LOGTO_ENDPOINT=https://pk5k15.logto.app/
LOGTO_APP_ID=wfys39gnwrpez0g29f1v0
LOGTO_APP_SECRET=wOrPwIrodl8rAPt8xEiEUIbDzYGju15M
LOGTO_COOKIE_SECRET=8GG2WSxFO1MncSiP1X8k8HO4x9leJfOp
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Auth Bypass (development only)
MOCK_AUTH=false  # Set true to skip auth checks in development
```

### Development Shortcuts
**To bypass auth in development (rapid iteration):**
- Set `MOCK_AUTH=true` in backend `.env`
- Set `MOCK_AUTH=true` in frontend `.env.local`
- Requests will succeed without valid Logto token
- **Warning:** Use only for local testing, never in production

### Production (Azure Key Vault)
- Secrets stored in Azure Key Vault, injected at runtime
- Container Apps reference Key Vault secrets via environment variables
- Never commit `.env` files to git
- Logto Cloud credentials stored in Key Vault
- JWT_SECRET_KEY must be 32+ characters for HS256 signing

---

## Bicep IaC (Azure Deployment)

### Structure
```
azure/
├── main.bicep                # Main template
├── parameters.json           # Parameter values
└── modules/
    ├── container-apps.bicep
    ├── postgresql.bicep
    ├── redis.bicep
    ├── storage.bicep
    └── networking.bicep
```

### Parameters (`azure/parameters.json`)
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "resourceGroupName": { "value": "agent-foundry-rg" },
    "location": { "value": "australiaeast" },
    "environmentName": { "value": "production" },
    "postgreSqlAdminPassword": { "value": "your-strong-password" },
    "containerImageUri": { "value": "yourregistry.azurecr.io/agent-foundry:latest" }
  }
}
```

---

## Deployment to Azure

### Phase 1: Preparation
1. Create resource group:
```bash
az group create \
  --name agent-foundry-rg \
  --location australiaeast
```

2. Create storage account for state (if using Terraform):
```bash
az storage account create \
  --name agentfoundrytf \
  --resource-group agent-foundry-rg \
  --location australiaeast \
  --sku Standard_LRS

az storage container create \
  --name terraform \
  --account-name agentfoundrytf
```

3. Build and push container images:
```bash
# Backend
az acr build \
  --registry yourregistry \
  --image agent-foundry:latest \
  --file backend/docker/Dockerfile \
  backend/

# Frontend
az acr build \
  --registry yourregistry \
  --image agent-foundry-frontend:latest \
  --file frontend/docker/Dockerfile \
  frontend/
```

### Phase 2: Deploy Infrastructure (Bicep)
```bash
# Validate template
az deployment group validate \
  --resource-group agent-foundry-rg \
  --template-file azure/main.bicep \
  --parameters azure/parameters.json

# Deploy
az deployment group create \
  --resource-group agent-foundry-rg \
  --template-file azure/main.bicep \
  --parameters azure/parameters.json

# Note outputs (API URL, frontend URL)
az deployment group show \
  --resource-group agent-foundry-rg \
  --name main
```

### Phase 3: Run Database Migrations
```bash
# Port-forward PostgreSQL
az resource show \
  --resource-group agent-foundry-rg \
  --name agent-foundry-postgres

# Connect and run migrations
psql -h <hostname> -U postgres -d agent_foundry
\c agent_foundry
-- Run migration scripts

# OR use Alembic from Container Apps
az container exec \
  --resource-group agent-foundry-rg \
  --name agent-foundry-fastapi \
  --exec-command "alembic upgrade head"
```

### Phase 4: Initialize Data
```bash
# Load agent configs
curl -X POST http://<api-url>/api/admin/load-agents \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "config_file=@agents_config/coder.yaml"
```

### Phase 5: Verify Deployment
```bash
# Health check
curl http://<api-url>/health

# Langfuse availability
curl http://<langfuse-url>/api/health

# Database connectivity
curl http://<api-url>/api/debug/db-health \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Container Apps Configuration

### FastAPI Service
**Specs:**
- 1–3 replicas (auto-scale)
- CPU: 0.25–1.0 cores
- Memory: 0.5–1.0 GB
- Container port: 8000
- Startup probe: /health (30s delay, 30s timeout)
- Liveness probe: /health (60s interval)

**Environment variables:** From Key Vault
```yaml
ENVIRONMENT: production
LOG_LEVEL: INFO
DATABASE_URL: <from Key Vault>
REDIS_URL: <from Key Vault>
LANGFUSE_PUBLIC_KEY: <from Key Vault>
# ... other secrets
```

### Celery Workers
**Specs:**
- 1–10 replicas (scale with queue depth)
- CPU: 0.5–2.0 cores
- Memory: 1–2 GB
- Container port: N/A (background workers)
- Startup probe: health check script
- Monitor Redis queue depth, scale accordingly

---

## CI/CD Pipeline (GitHub Actions)

### File: `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements-dev.txt
      - run: black --check src/
      - run: isort --check-only src/
      - run: mypy src/
      - run: pytest tests/ -v --cov=src --cov-report=xml
      - uses: codecov/codecov-action@v3
```

### File: `.github/workflows/cd.yml`
```yaml
name: CD

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - name: Build & push backend
        run: |
          az acr build \
            --registry yourregistry \
            --image agent-foundry:latest \
            --file backend/docker/Dockerfile \
            backend/
      - name: Build & push frontend
        run: |
          az acr build \
            --registry yourregistry \
            --image agent-foundry-frontend:latest \
            --file frontend/docker/Dockerfile \
            frontend/
      - name: Deploy to Container Apps
        run: |
          az containerapp update \
            --resource-group agent-foundry-rg \
            --name agent-foundry-fastapi \
            --image yourregistry.azurecr.io/agent-foundry:latest
```

---

## Monitoring & Troubleshooting

### View Logs
```bash
# FastAPI logs
az container logs \
  --resource-group agent-foundry-rg \
  --name agent-foundry-fastapi

# Celery worker logs
az container logs \
  --resource-group agent-foundry-rg \
  --name agent-foundry-worker
```

### Health Checks
```bash
# API health
curl http://<api-url>/health

# Database health
curl http://<api-url>/api/admin/health \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Queue depth
curl http://<api-url>/api/admin/queue-depth \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Common Issues

**Issue: Database connection timeout**
- Check PostgreSQL firewall rules (allow Azure services)
- Verify DATABASE_URL in Key Vault
- Test locally: `psql -h <host> -U postgres`

**Issue: Container restart loop**
- Check logs: `az container logs ...`
- Verify environment variables set
- Run health check: `curl /health`

**Issue: High LLM costs**
- Check Langfuse dashboard (cost by agent)
- Review guardrails (cost limits enforced?)
- Consider routing expensive tasks to cheaper LLM

**Issue: Slow database queries**
- Check PostgreSQL slow query log
- Add indexes on frequently filtered columns
- Use `EXPLAIN ANALYZE` to profile queries

---

## Scaling Strategy

### Vertical (Larger Instances)
- Increase container CPU/memory
- PostgreSQL: upgrade to D2s, D4s tier
- Redis: upgrade to Standard or Premium

### Horizontal (More Instances)
- Container Apps: auto-scale replicas based on CPU/memory
- FastAPI: 3–5 instances (load-balanced)
- Celery workers: 5–10 instances (queue depth scaling)
- PostgreSQL: read replicas (Phase 3+)

### Cost Optimization
- Scale to zero when idle (Container Apps feature)
- Reserved instances (if sustained usage)
- Auto-pause PostgreSQL after inactivity
- Cache frequently accessed data (Redis)

---

## Backup & Disaster Recovery

### Database Backups
```bash
# Azure-managed backups (automatic, 7-day retention)
az postgres flexible-server backup show \
  --resource-group agent-foundry-rg \
  --server-name agent-foundry-postgres

# Manual backup
az postgres flexible-server backup create \
  --resource-group agent-foundry-rg \
  --server-name agent-foundry-postgres \
  --backup-name manual-$(date +%Y%m%d)
```

### Restore from Backup
```bash
az postgres flexible-server restore \
  --resource-group agent-foundry-rg \
  --name agent-foundry-postgres-restored \
  --source-server agent-foundry-postgres \
  --backup-name <backup-name>
```

### Redis Snapshots
- Container Apps volumes persist Redis data
- Manual export: `redis-cli BGSAVE`

### Memgraph Snapshots
- Docker volume persists data
- Export: `memgraph-ctl --save-snapshot`

---

## Rollback Procedure

### Container Apps Rollback
1. Identify previous working image tag
2. Update Container App to previous image:
```bash
az containerapp update \
  --resource-group agent-foundry-rg \
  --name agent-foundry-fastapi \
  --image yourregistry.azurecr.io/agent-foundry:v1.0.0
```

### Database Rollback
1. Restore from backup (see Backup & DR section)
2. Verify restore successful
3. Test application against restored DB

---

## Production Checklist

- [ ] All environment variables set in Key Vault
- [ ] Database backups scheduled + verified
- [ ] Langfuse instance healthy + accessible
- [ ] TLS certificates valid (HTTPS)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Auth tokens rotated
- [ ] Monitoring alerts configured
- [ ] On-call rotation established
- [ ] Runbooks documented (incident response)
- [ ] Team trained on deployment procedure
- [ ] Cost monitoring dashboard set up

---

## Useful Commands

```bash
# List all resources in RG
az resource list --resource-group agent-foundry-rg

# Get connection strings
az postgres flexible-server connection-string show \
  --resource-group agent-foundry-rg \
  --name agent-foundry-postgres \
  --client psql

# Restart service
az containerapp restart \
  --resource-group agent-foundry-rg \
  --name agent-foundry-fastapi

# Check resource usage
az containerapp stats \
  --resource-group agent-foundry-rg \
  --name agent-foundry-fastapi
```

---

## Logto Cloud Integration

**Overview:**
- Uses Logto Cloud (managed OIDC) instead of self-hosted Docker container
- Logto endpoint: https://pk5k15.logto.app/
- App ID: wfys39gnwrpez0g29f1v0 (configured in docker-compose.yml)

**Auth Flow:**
1. Frontend uses @logto/next SDK for sign-in/sign-out
2. Redirects to Logto Cloud for OIDC authentication
3. Backend validates tokens via JWKS endpoint (PyJWKClient)
4. JWT stored in HTTP-only cookie (NextAuth.js)

**Switching to Self-Hosted Logto (optional):**
- Uncomment logto service in docker-compose.yml (currently commented out)
- Set `LOGTO_ENDPOINT=http://localhost:3210` in .env
- Build and run: `docker-compose up logto`

---

## Document Metadata
- **Version:** 2.1
- **Last Updated:** 2026-03-15
- **Owner:** DevOps Team
- **Status:** Active (10-service local stack + Logto Cloud auth deployed; frontend testing commands integrated)
