# Codebase Summary

This document describes the directory structure and implemented modules for agent-foundry. As of Phase 1 Week 1, the foundation infrastructure and scaffolding are complete.

---

## Directory Structure

```
agent-foundry/
├── README.md                               # Project overview & quick start
├── .gitignore
├── .env.example                            # Template for environment variables
├── requirements.txt                        # Python dependencies (pinned versions)
├── requirements-dev.txt                    # Dev dependencies (pytest, black, mypy)
├── pyproject.toml                          # Python project metadata
├── docker-compose.yml                      # Local dev stack (PostgreSQL, Redis, Memgraph, pgai)
├── Dockerfile                              # Backend container
│
├── docs/                                   # Documentation (this directory)
│   ├── project-overview-pdr.md             # Product requirements (REQ-*)
│   ├── code-standards.md                   # Code style, conventions, patterns
│   ├── system-architecture.md              # System design, data flow, deployment
│   ├── codebase-summary.md                 # This file — planned structure
│   ├── project-roadmap.md                  # Phases, timeline, milestones
│   ├── deployment-guide.md                 # Azure setup, CI/CD, scaling
│   └── design-guidelines.md                # UI/UX standards, components
│
├── backend/                                # Python backend (FastAPI + agents)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py                         # FastAPI app entry point + app factory
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── health.py                   # GET /health (readiness probe)
│   │   │   ├── agents.py                   # GET /agents, GET /agents/{id} (stubs)
│   │   │   └── tasks.py                    # POST /tasks, GET /tasks/{id} (stubs)
│   │
│   ├── agents/                             # Agent implementations
│   │   ├── __init__.py
│   │   ├── base.py                         # Base Agent ABC class + TaskInput/TaskResult
│   │   ├── coder.py                        # Coder agent stub (ready for tools)
│   │   └── researcher.py                   # Research agent stub (ready for tools)
│   │   │
│   ├── memory/                             # Memory backends (stubs)
│   │   ├── __init__.py
│   │   ├── pgai.py                         # PgaiMemoryService stub
│   │   └── memgraph.py                     # MemgraphService stub
│   │
│   └── workers/                            # Celery task execution
│       ├── __init__.py
│       └── celery_app.py                   # Celery app configuration (stub)
│   │
│   ├── pyproject.toml                      # Python project metadata + dependencies
│   └── Dockerfile                          # Backend container image
│
├── frontend/                               # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx                      # Root layout (implemented)
│   │   └── page.tsx                        # Landing page (implemented)
│   │
│   ├── components/                         # React components (Phase 2+)
│   │   └── (placeholder for future components)
│   │
│   ├── package.json                        # Dependencies (Next.js 15, React 19, Tailwind v4)
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── .env.example                        # Frontend environment variables
│
├── infra/                                  # Docker Compose infrastructure
│   ├── docker-compose.yml                  # Local dev stack (7 services)
│   ├── litellm_config.yaml                 # LiteLLM routing config
│   ├── init.sql                            # PostgreSQL initialization
│   ├── traefik/                            # Traefik reverse proxy config
│   │   └── traefik.yml
│   └── docker-compose.prod.yml             # Production overrides (Phase 2+)
│
├── Makefile                                # Development commands (up, down, api, worker, fe, etc.)
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
│
└── plans/                                  # Project planning
    └── reports/                            # Generated reports from tasks
```

---

## Key Modules

### Backend Core (Phase 1 - Implemented)

#### `api/main.py`
- FastAPI app factory
- Middleware setup (logging, CORS)
- Route registration (health, agents, tasks routers)
- Uvicorn configuration

#### `agents/base.py`
- Abstract `Agent` base class
- `TaskInput` Pydantic model (goal, context, budget)
- `TaskResult` Pydantic model (output, metadata, cost)
- Base methods for agent subclasses to inherit

#### `agents/coder.py` & `agents/researcher.py`
- Concrete agent stubs inheriting from `Agent`
- Ready for tool integration (Phase 1 Week 3)
- Placeholders for LLM invocation logic

#### `api/routers/health.py`
- `GET /health` — Readiness probe for Kubernetes/load balancers
- Returns service status + dependency checks

#### `api/routers/agents.py` (stubs)
- `GET /agents` — List all agents with metadata
- `GET /agents/{id}` — Get single agent details

#### `api/routers/tasks.py` (stubs)
- `POST /tasks` — Create & enqueue task
- `GET /tasks/{id}` — Get task status + results

### Database & Memory (Phase 1 - Infrastructure Ready)

#### PostgreSQL (via Docker)
- Port 5432 (internal), exposed via Traefik
- Initialized from `infra/init.sql`
- Ready for Alembic migrations (to be created Week 2–4)

#### pgai (PostgreSQL + pgvector)
- Semantic search backend
- `PgaiMemoryService` stub implemented
- Ready for embedding + chunk retrieval (Week 3+)

#### Memgraph
- Graph database via `infra/docker-compose.yml`
- Memgraph Lab UI at http://mglab.localhost
- `MemgraphService` stub implemented
- Ready for Agent-Task-Project relationships (Week 4+)

#### Redis
- Task queue backend
- Used by Celery for job distribution
- Configured in `infra/docker-compose.yml`

### Tools (Phase 2+)
- Tool implementations deferred to Week 3 (Coder agent)
- Plan: GitHub MCP, code interpreter, web search, PDF reader
- All tools inherit from base `Tool` ABC (to be created)

---

## Frontend Components (Phase 1 - Scaffolded)

### Pages

#### `app/layout.tsx`
- Root layout with Tailwind styling
- Navigation structure prepared
- Meta tags + fonts configured

#### `app/page.tsx`
- Landing page skeleton
- Value proposition, agent showcase sections
- Prepared for Phase 2 marketplace implementation

### Components & Pages (Phase 2+)
- Deferred to Phase 2: Agents marketplace, task creation, monitoring, billing pages
- React hook implementations (useAgents, useTasks, useSSE) ready for integration

---

## Technology Dependencies

### Backend (Installed)
- `fastapi`, `uvicorn` — Web framework, ASGI server
- `pydantic`, `pydantic-settings` — Data validation
- `psycopg` — PostgreSQL driver
- `celery`, `redis` — Task queue
- `crewai` — Agent orchestration framework
- `litellm` — LLM routing (200+ models)
- `anthropic`, `openai` — LLM SDKs
- `langfuse` — LLM tracing
- `pytest` — Testing

### Backend (Deferred to Phase 1 Week 3+)
- `langgraph` — Workflow graphs
- `sqlalchemy` — ORM + migrations
- `pgvector` — Semantic search
- `neo4j` — Memgraph driver

### Frontend (Installed)
- `next` 15 — React framework
- `react` 19 — UI library
- `typescript` — Type safety
- `tailwindcss` v4 — Styling
- `zustand` — State management
- `@tanstack/query`, `@tanstack/router`, `@tanstack/form` — Data & routing

### Frontend (Deferred to Phase 2+)
- `next-auth` — Authentication
- `tamagui` — Cross-platform (Phase 2)
- `recharts` — Data visualization

### Infrastructure
- Docker Compose — Local dev stack
- Traefik v3 — Reverse proxy
- PostgreSQL 15 + pgvector — Database
- Redis 7 — Cache/queue
- Memgraph — Graph database
- LiteLLM — LLM proxy
- Langfuse — LLM dashboard

---

## Document Metadata
- **Version:** 1.1
- **Last Updated:** 2026-03-14
- **Owner:** Engineering Team
- **Status:** Phase 1 Week 1 Complete (Foundation Infrastructure)
