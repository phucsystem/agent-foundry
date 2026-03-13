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
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py                         # FastAPI app entry point
│   │   ├── config.py                       # Settings (Pydantic BaseSettings)
│   │   ├── dependencies.py                 # FastAPI dependency injection (DB, auth)
│   │   ├── security.py                     # Auth (OAuth2, API key validation)
│   │   │
│   │   ├── agents/                         # Agent implementations
│   │   │   ├── __init__.py
│   │   │   ├── base.py                     # Base Agent class (CrewAI wrapper)
│   │   │   ├── agent-loader.py             # Load agents from YAML config
│   │   │   ├── coder.py                    # Coder agent (code interpretation)
│   │   │   ├── research.py                 # Research agent (web search + RAG)
│   │   │   ├── pm.py                       # PM agent (PRD generation) — Phase 2
│   │   │   ├── qa.py                       # QA agent (test execution) — Phase 2
│   │   │   ├── copywriter.py               # Copywriter agent — Phase 2
│   │   │   ├── designer.py                 # Image Design agent — Phase 3
│   │   │   └── video-editor.py             # Video Design agent — Phase 3
│   │   │
│   │   ├── orchestrator/                   # Multi-agent orchestration
│   │   │   ├── __init__.py
│   │   │   ├── crew-manager.py             # CrewAI manager orchestrator
│   │   │   └── langgraph-flow.py           # LangGraph orchestrator (Phase 2+)
│   │   │
│   │   ├── tools/                          # Tool implementations
│   │   │   ├── __init__.py
│   │   │   ├── base-tool.py                # Base Tool class
│   │   │   ├── github-mcp.py               # GitHub MCP integration
│   │   │   ├── notion-mcp.py               # Notion MCP integration
│   │   │   ├── web-search.py               # Web search tool
│   │   │   ├── file-io.py                  # File read/write
│   │   │   ├── code-interpreter.py         # Python/JavaScript execution
│   │   │   ├── playwright.py               # Browser automation
│   │   │   ├── terminal.py                 # Bash execution (with safeguards)
│   │   │   ├── figma-api.py                # Figma design tool — Phase 3
│   │   │   └── ffmpeg.py                   # Video processing — Phase 3
│   │   │
│   │   ├── memory/                         # Memory backends
│   │   │   ├── __init__.py
│   │   │   ├── base-memory.py              # Abstract memory interface
│   │   │   ├── postgres-memory.py          # PostgreSQL queries (structured)
│   │   │   ├── pgai-memory.py              # pgai semantic search + RAG
│   │   │   ├── memgraph-memory.py          # Memgraph relationships
│   │   │   └── memory-manager.py           # Coordinate memory backends
│   │   │
│   │   ├── guardrails/                     # Output validation & cost control
│   │   │   ├── __init__.py
│   │   │   ├── validator.py                # Output schema validation
│   │   │   ├── cost-guardrail.py           # Budget enforcement
│   │   │   ├── hallucination-detector.py   # Fact-check agent outputs
│   │   │   └── toxicity-filter.py          # Content safety
│   │   │
│   │   ├── models/                         # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── task.py                     # TaskInput, TaskResult, TaskStatus
│   │   │   ├── agent.py                    # AgentConfig, AgentStatus
│   │   │   ├── user.py                     # User, Team, Subscription
│   │   │   ├── billing.py                  # Invoice, UsageRecord
│   │   │   └── tool.py                     # ToolDefinition, ToolCall
│   │   │
│   │   ├── api/                            # FastAPI routes
│   │   │   ├── __init__.py
│   │   │   ├── agents-router.py            # GET /agents, GET /agents/{id}
│   │   │   ├── tasks-router.py             # POST /tasks, GET /tasks/{id}
│   │   │   ├── subscriptions-router.py     # GET /subscriptions, PATCH /subscriptions
│   │   │   ├── billing-router.py           # GET /billing/usage, GET /billing/invoices
│   │   │   ├── teams-router.py             # POST /teams, GET /teams/{id}
│   │   │   └── health-router.py            # GET /health (readiness probe)
│   │   │
│   │   ├── worker/                         # Celery task execution
│   │   │   ├── __init__.py
│   │   │   ├── celery-app.py               # Celery app configuration
│   │   │   ├── task-worker.py              # execute_task() task function
│   │   │   └── job-scheduler.py            # Schedule recurring jobs
│   │   │
│   │   ├── integrations/                   # External service adapters
│   │   │   ├── __init__.py
│   │   │   ├── langfuse-client.py          # LLM tracing
│   │   │   ├── opentelemetry-setup.py      # Metrics collection
│   │   │   ├── litellm-router.py           # LLM routing config
│   │   │   ├── stripe-client.py            # Billing — Phase 2
│   │   │   └── webhook-publisher.py        # Event distribution
│   │   │
│   │   ├── db/                             # Database
│   │   │   ├── __init__.py
│   │   │   ├── postgres-client.py          # PostgreSQL connection pool
│   │   │   ├── migrations/                 # Alembic migrations
│   │   │   │   ├── env.py
│   │   │   │   ├── script.py.mako
│   │   │   │   └── versions/
│   │   │   │       ├── 001-initial-schema.py
│   │   │   │       ├── 002-agents-config.py
│   │   │   │       └── ...
│   │   │   ├── models.py                   # SQLAlchemy ORM models
│   │   │   └── queries.py                  # Common SQL queries
│   │   │
│   │   └── utils/                          # Utilities
│   │       ├── __init__.py
│   │       ├── logger.py                   # Structured logging
│   │       ├── http-client.py              # Async HTTP client wrapper
│   │       ├── jwt-handler.py              # JWT encode/decode
│   │       └── cost-estimator.py           # LLM cost forecasting
│   │
│   ├── agents_config/                      # YAML agent definitions
│   │   ├── coder.yaml                      # Coder agent config
│   │   ├── research.yaml                   # Research agent config
│   │   ├── pm.yaml                         # PM agent config (Phase 2)
│   │   ├── qa.yaml                         # QA agent config (Phase 2)
│   │   ├── copywriter.yaml                 # Copywriter config (Phase 2)
│   │   └── _schema.json                    # JSON schema for validation
│   │
│   ├── tests/                              # Unit & integration tests
│   │   ├── __init__.py
│   │   ├── conftest.py                     # pytest fixtures
│   │   ├── test-agents.py                  # Agent tests
│   │   ├── test-orchestrator.py            # Orchestration tests
│   │   ├── test-tools.py                   # Tool tests
│   │   ├── test-memory.py                  # Memory backend tests
│   │   ├── test-guardrails.py              # Guardrail validation tests
│   │   ├── test-api.py                     # API endpoint tests
│   │   └── fixtures/                       # Test data
│   │       ├── sample-tasks.yaml
│   │       └── sample-context.md
│   │
│   └── docker/
│       └── Dockerfile                      # Backend container
│
├── frontend/                               # Next.js frontend
│   ├── app/                                # App Router pages
│   │   ├── layout.tsx                      # Root layout
│   │   ├── page.tsx                        # Home page
│   │   ├── agents/
│   │   │   ├── page.tsx                    # Agent marketplace
│   │   │   └── [id]/page.tsx               # Agent detail
│   │   ├── tasks/
│   │   │   ├── page.tsx                    # Task list
│   │   │   ├── create/page.tsx             # Create task
│   │   │   └── [id]/page.tsx               # Task monitor + results
│   │   ├── billing/
│   │   │   ├── page.tsx                    # Billing dashboard
│   │   │   └── invoices/page.tsx           # Invoice history
│   │   ├── teams/
│   │   │   ├── page.tsx                    # Team management
│   │   │   └── [id]/page.tsx               # Team detail
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts # NextAuth.js routes
│   │       └── webhook/stripe/route.ts     # Stripe webhooks (Phase 2)
│   │
│   ├── components/                         # React components
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── agents/
│   │   │   ├── AgentCard.tsx               # Agent listing card
│   │   │   ├── AgentDetail.tsx             # Agent detail view
│   │   │   └── AgentFilter.tsx             # Filter controls
│   │   ├── tasks/
│   │   │   ├── TaskForm.tsx                # Create/edit task
│   │   │   ├── TaskMonitor.tsx             # Live progress monitor
│   │   │   ├── TaskResult.tsx              # Result display
│   │   │   └── TaskHistory.tsx             # Past tasks list
│   │   ├── billing/
│   │   │   ├── BillingDashboard.tsx
│   │   │   ├── CostBreakdown.tsx
│   │   │   └── SubscriptionSelector.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   │
│   ├── lib/                                # Utilities & API clients
│   │   ├── api-client.ts                   # Fetch wrapper
│   │   ├── hooks/
│   │   │   ├── useAgents.ts                # Fetch agents (React Query)
│   │   │   ├── useTasks.ts                 # Fetch tasks
│   │   │   ├── useSSE.ts                   # Live task monitoring
│   │   │   └── useAuth.ts                  # Auth hook
│   │   ├── utils/
│   │   │   ├── format-cost.ts              # Format currency
│   │   │   └── format-duration.ts          # Format time
│   │   └── types.ts                        # TypeScript interfaces (match Pydantic)
│   │
│   ├── styles/
│   │   ├── globals.css                     # Tailwind directives + global styles
│   │   └── dark.css                        # Dark mode overrides
│   │
│   ├── public/
│   │   ├── logo.png
│   │   └── favicon.ico
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── docker/
│       └── Dockerfile                      # Frontend container
│
├── azure/                                  # Infrastructure as Code
│   ├── main.bicep                          # Main Bicep template
│   ├── parameters.json                     # Bicep parameters
│   ├── modules/
│   │   ├── container-apps.bicep            # Container Apps (FastAPI, workers)
│   │   ├── postgresql.bicep                # PostgreSQL Flexible Server
│   │   ├── redis.bicep                     # Azure Cache for Redis
│   │   ├── storage.bicep                   # Blob storage (logs, artifacts)
│   │   └── networking.bicep                # VNET, security groups
│   └── scripts/
│       ├── deploy.sh                       # Deployment script
│       └── teardown.sh                     # Cleanup script
│
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Run tests on PR
│       ├── cd.yml                          # Deploy on merge to main
│       └── security-scan.yml               # Dependency scanning
│
└── plans/                                  # Project planning
    ├── README.md
    └── reports/                            # Generated reports from tasks
```

---

## Key Modules

### Backend Core

#### `src/main.py`
- FastAPI application factory
- Middleware setup (auth, logging, CORS)
- Route registration
- Database connection pooling
- Redis connection

#### `src/agents/base.py`
- Abstract `Agent` class
- Inherits from CrewAI `Agent`
- Methods: `execute(task_input)`, `initialize_tools()`, `load_config()`
- Handles CrewAI initialization, memory attachment, guardrail setup

#### `src/orchestrator/crew-manager.py`
- CrewAI `Crew` wrapper
- Methods: `add_agents()`, `execute_workflow()`, `handle_errors()`
- Routes tasks to correct agent(s) based on task type
- Aggregates results from multiple agents

#### `src/worker/task-worker.py`
- Celery task: `execute_task(task_id, user_id)`
- Workflow:
  1. Load task from PostgreSQL
  2. Retrieve context from pgai
  3. Load agent config
  4. Invoke orchestrator
  5. Validate output (guardrails)
  6. Store result + cost
  7. Publish events

#### `src/api/tasks-router.py`
- `POST /tasks` — Create & enqueue task
- `GET /tasks/{id}` — Get task status
- `GET /tasks` — List user's tasks (with pagination)
- `GET /tasks/{id}/results` — Download results

### Database

#### `src/db/models.py` (SQLAlchemy ORM)
```python
# Core tables:
class User(Base):
    id: UUID
    email: str
    tier: str  # "solo", "small_team", "full_squad"
    api_key: str

class Task(Base):
    id: UUID
    user_id: UUID
    agent_id: str
    goal: str
    input_json: str  # JSON
    output_json: str
    status: str  # "pending", "running", "completed", "failed"
    cost_cents: int
    created_at: DateTime
    completed_at: DateTime

class AgentConfig(Base):
    id: str  # "coder", "research", etc.
    version: int  # v1, v2, ...
    yaml_content: str
    created_at: DateTime
```

#### Alembic Migrations
- Version control for schema changes
- Track all modifications to tables, indexes

### Tools

#### `src/tools/github-mcp.py`
- Wrapper around GitHub MCP
- Methods: `create_pr()`, `read_file()`, `commit()`

#### `src/tools/code-interpreter.py`
- Execute Python/Node.js in container
- Sandboxed with timeouts
- Methods: `run_python()`, `run_javascript()`

---

## Frontend Components

### Pages

#### `app/agents/page.tsx`
- Display all agents (filters by role, cost, tier)
- Use `useAgents()` hook (React Query)
- Cards with agent name, bio, price, success rate
- Click → navigate to agent detail

#### `app/tasks/create/page.tsx`
- Form to create task (goal, context, budget)
- Upload context documents (PDF, markdown)
- Select agent or auto-select based on goal
- Preview estimated cost
- Submit → API POST /tasks

#### `app/tasks/[id]/page.tsx`
- Real-time progress monitor (SSE stream)
- Show agent reasoning + tool calls
- Collect result when done
- Download button (PDF, markdown, JSON)
- Rating form

### Hooks

#### `lib/hooks/useSSE.ts`
- Open SSE connection to `/api/tasks/{id}/stream`
- Parse messages: `{"type": "status_update", "data": {...}}`
- Return latest status + new messages
- Auto-reconnect on disconnect

---

## Technology Dependencies

### Backend
- `crewai` — Agent orchestration
- `langgraph` — Workflow graphs (Phase 2)
- `fastapi`, `uvicorn` — Web framework
- `sqlalchemy` — ORM
- `psycopg` — PostgreSQL driver
- `asyncpg` — Async PostgreSQL
- `pgvector` — Semantic search (pgai integration)
- `celery`, `redis` — Task queue
- `pydantic`, `pydantic-settings` — Validation
- `litellm` — LLM routing
- `anthropic` — Claude SDK
- `openai` — GPT integration (fallback)
- `langfuse` — LLM tracing
- `opentelemetry` — Metrics
- `neo4j` — Memgraph driver (Phase 2)
- `pytest` — Testing
- `black`, `isort`, `mypy` — Code quality (dev)

### Frontend
- `next` — Framework
- `typescript` — Language
- `tailwindcss` — Styling
- `react-query` — Server state
- `next-auth` — Authentication
- `zod` + `react-hook-form` — Form validation
- `recharts` — Data visualization (Phase 2)
- `tamagui` — Cross-platform (Phase 2)
- `vitest`, `@testing-library/react` — Testing

### Infrastructure
- `docker`, `docker-compose` — Containers
- `azure-cli` — Azure CLI
- `bicep` — IaC

---

## Document Metadata
- **Version:** 1.0
- **Last Updated:** 2026-03-14
- **Owner:** Engineering Team
- **Status:** Planned (pre-implementation)
