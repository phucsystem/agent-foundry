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

# Start dev server
npm run dev
```

### 4. Verify Everything
- Backend: http://localhost:8000/docs (Swagger)
- Frontend: http://localhost:3000
- Database: PostgreSQL on localhost:5432
- Redis: localhost:6379
- Memgraph: localhost:7687

---

## Docker Compose (Local Stack)

### Configuration (`docker-compose.yml`)
Services:
- **postgres** — PostgreSQL 14 (volumes: persistent data)
- **pgvector** — pgvector extension auto-loaded
- **redis** — Redis 6 (task queue)
- **memgraph** — Memgraph 5 (relational graph)
- **fastapi** — Backend API (build from Dockerfile)
- **celery-worker** — Async task executor (build from Dockerfile)

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
DATABASE_URL=postgresql://user:password@localhost:5432/agent_foundry
REDIS_URL=redis://localhost:6379

# LLM APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...

# Observability
LANGFUSE_PUBLIC_KEY=...
LANGFUSE_SECRET_KEY=...
LANGFUSE_HOST=http://localhost:3030  # self-hosted instance

# Auth
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Azure (optional for local, required for production)
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=
AZURE_CONTAINER_REGISTRY_URL=
AZURE_RESOURCE_GROUP=

# Application
DEBUG=True
LOG_LEVEL=INFO
ENVIRONMENT=development
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

### Production (Azure Key Vault)
- Secrets stored in Azure Key Vault, injected at runtime
- Container Apps reference Key Vault secrets via environment variables
- Never commit `.env` files to git

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

## Document Metadata
- **Version:** 1.0
- **Last Updated:** 2026-03-14
- **Owner:** DevOps Team
- **Status:** Active (pre-deployment)
