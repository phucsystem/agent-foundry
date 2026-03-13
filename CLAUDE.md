# CLAUDE.md

Project-level instructions for Claude Code when working in agent-foundry.

## Project

**Agent Foundry** — AI agent platform: build, deploy, and hire out specialised AI agents on weekly subscriptions.

## Tech Stack

### Backend (Python)
- **Framework:** FastAPI + Uvicorn
- **Agents:** CrewAI + LangGraph
- **Task queue:** Celery + Redis
- **Database:** PostgreSQL + pgvector (semantic memory), Memgraph (relational graph)
- **LLM routing:** LiteLLM proxy (Anthropic, OpenRouter, OpenAI)
- **Observability:** Langfuse (LLM tracing), OpenTelemetry
- **Schema validation:** Pydantic v2

### Frontend (TypeScript)
- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS v4
- **Cross-platform:** Tamagui
- **Data:** TanStack Query, Table, Router, Form, Virtual
- **Auth:** NextAuth.js v5
- **State:** Zustand

### Infrastructure
- **Local:** Docker Compose (Traefik, Postgres, Redis, Memgraph, LiteLLM, Langfuse)
- **Production:** Azure (Container Apps, Static Web Apps, PostgreSQL Flexible)
- **IaC:** Azure Bicep
- **CI/CD:** GitHub Actions

## Repo Structure

```
agent-foundry/
├── backend/           # Python — FastAPI + CrewAI + LangGraph
│   ├── api/           # FastAPI app + routers
│   ├── agents/        # Agent implementations (base, coder, researcher, etc.)
│   ├── memory/        # pgai.py (semantic), memgraph.py (relational)
│   ├── workers/       # Celery workers
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/          # Next.js + TypeScript
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   └── package.json
├── infra/             # Docker Compose + Traefik + LiteLLM config
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── litellm_config.yaml
│   ├── init.sql
│   └── traefik/
├── docs/              # Project documentation
└── plans/             # Implementation plans
```

## Development Commands

```bash
make up        # Start Docker infra (Postgres, Redis, Memgraph, LiteLLM, Langfuse)
make down      # Stop Docker infra
make api       # Run FastAPI dev server (localhost:8000)
make worker    # Run Celery worker
make fe        # Run Next.js dev server (localhost:3000)
make migrate   # Run Alembic DB migrations
make seed      # Seed sample agent configs
make logs      # Tail Docker logs
make reset     # Wipe volumes and restart
```

## Local Service URLs

| Service | URL |
|---------|-----|
| FastAPI | http://localhost:8000 |
| FastAPI docs | http://localhost:8000/docs |
| Frontend | http://localhost:3000 |
| LiteLLM | http://litellm.localhost |
| Langfuse | http://langfuse.localhost |
| Memgraph Lab | http://mglab.localhost |
| Traefik dashboard | http://localhost:8080 |

## Code Standards

### Python
- Type hints mandatory on all functions
- Pydantic models for all I/O contracts
- `async def` for I/O-bound operations
- Custom exceptions for domain errors (never bare `except:`)
- Logging via `logging.getLogger(__name__)`, not `print()`
- File size < 200 lines; split if larger

### TypeScript
- Strict mode always enabled
- No `any` types — use `unknown` with type guards
- `interface` for prop contracts
- TanStack Query for server state, Zustand for global client state

### General
- File naming: kebab-case
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- No hardcoded secrets — use `.env` + Pydantic Settings
- No `var` in JS/TS — only `const` and `let`
- Descriptive variable names (no single-character names)

## Architecture Principles

- **Separation of Structure from Intelligence:** Flow (deterministic routing/validation) vs Crew (LLM reasoning within boundaries)
- **Agent anatomy:** Identity → Brain → Tools → Memory → Guardrails → I/O Contract
- **Memory routing:** pgvector for "what's similar?" | Memgraph for "how is X connected to Y?" | Plain PG for billing/auth
- **LLM routing:** Claude Sonnet for reasoning, DeepSeek for code, Gemini Flash for cheap tasks, openrouter/auto for fallback

## Notion Integration

- **Requirements:** https://www.notion.so/3226064112fa80df98f7e96970fbee27
- **Task board:** https://www.notion.so/3226064112fa80db92fbd9cb7752f8ab
- Update Notion task status when starting/completing plan phases

## Workflows

- Read `docs/` directory for detailed standards and architecture
- Plans live in `plans/` directory with timestamped folders
- Always run compile/lint check after modifying code files
- Run tests before pushing — do not ignore failures
