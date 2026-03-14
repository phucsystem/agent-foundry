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

## Frontend Components (Phase 1 Complete, Phase 11 Implemented)

### Pages

#### `app/layout.tsx` (Phase 1 - Complete)
- Root layout with Tailwind v4 styling + @theme design tokens
- Sidebar navigation with 4 main routes: Agents, Create Task, Tasks, Billing
- Dark mode toggle persisted to localStorage
- QueryClientProvider + Providers wrapper for TanStack Query
- Meta tags + fonts configured

#### `app/page.tsx` (Phase 11 - Complete)
- Redirects to `/agents` marketplace

#### `app/agents/page.tsx` (Phase 11 - Complete)
- Agent marketplace Server Component
- Browse all agents (7 total: Coder, Research, PM, QA, Copywriter, Image Design, Video Design)
- Filter by role, cost range, success rate (client island)
- 4-column responsive grid (1-col mobile, 2-col tablet, 4-col desktop)
- Pagination support
- Coming-soon agents display with disabled state

#### `app/agents/[id]/page.tsx` (Phase 11 - Complete)
- Agent detail page Server Component
- Hero section with agent bio, tools, specialisation
- Stats bar (success rate, avg cost, avg runtime, total tasks)
- Sample outputs grid (2-col)
- Reviews section (3 reviews per agent)
- Pricing tiers (3-tier: Solo, Small Team, Full Squad)
- Mobile sticky footer with Hire button

#### `app/tasks/page.tsx` (Phase 11 - Complete)
- Task Board (Kanban) page
- 4 columns: Queued, Running, Completed, Failed
- KPI metrics row (Total Tasks, Success Rate, Avg Duration, Total Cost)
- Filter bar (search, agent, priority, date range) - visual only for MVP
- "Show N more" button in Completed column
- Real-time progress bars for running tasks
- Cost + duration metrics for completed tasks
- Error messages + retry buttons for failed tasks

#### `app/tasks/new/page.tsx` (Phase 11 - Complete)
- Task creation wizard (5-step form)
- Step 1: Task goal (textarea)
- Step 2: Context documents (drop zone, visual only)
- Step 3: Agent selection (radio grid, 3 agents)
- Step 4: Budget slider ($10-$500)
- Step 5: Review table + Submit
- Form submission navigates to `/tasks`

#### `app/tasks/[id]/page.tsx` (Phase 11 - Complete)
- Task detail/results page Server Component
- Task header card with status, priority, Re-run/Share buttons
- 6-metric grid: Duration, Total Cost, Tokens, Tool Calls, LLM Model, Retries
- Cost breakdown bar (input/output/tools segments)
- Task output section (tabs: Report, Code, Reasoning Trace, Tool Calls)
- Execution timeline (vertical line, 6 colored entries)
- Rating form (5-star interactive)
- Bottom actions (Hire Again, Back to Board, Browse Agents)

### UI Components (Phase 1 - Complete, 15 primitives)

#### Layout
- `components/layout/sidebar.tsx` — Navigation with active link detection
- `components/layout/theme-toggle.tsx` — Dark mode toggle with localStorage persistence
- `components/layout/providers.tsx` — QueryClientProvider wrapper

#### UI Primitives
- `components/ui/button.tsx` — Primary/secondary/danger variants, sm/default sizes
- `components/ui/card.tsx` — Card wrapper with shadow and borders
- `components/ui/badge.tsx` — Status badges (success/error/warning/info/neutral)
- `components/ui/input.tsx` — Form inputs, textareas, selects
- `components/ui/avatar.tsx` — Avatar with sizes (sm/default/lg/xl) + gradient backgrounds
- `components/ui/progress-bar.tsx` — Animated progress bar with percentage
- `components/ui/pagination.tsx` — Page number buttons with active state
- `components/ui/search-bar.tsx` — Search input + filter button group
- `components/ui/kpi-card.tsx` — KPI metric card (label, value, change indicator)
- `components/ui/star-rating.tsx` — Star rating display + interactive mode
- `components/ui/tabs.tsx` — Tab group with active indicator

#### Agent Components (Phase 11)
- `components/agents/agent-card.tsx` — Marketplace card (Server Component)
- `components/agents/agent-filters.tsx` — Search + filter bar (Client)
- `components/agents/agent-hero.tsx` — Detail page hero section
- `components/agents/agent-stats-bar.tsx` — 4-metric stats grid
- `components/agents/agent-reviews.tsx` — Reviews list
- `components/agents/agent-pricing.tsx` — 3-tier pricing grid

#### Task Components (Phase 11)
- `components/tasks/task-form.tsx` — 5-step task creation form (Client)
- `components/tasks/task-form-steps.tsx` — Step indicator (1-5)
- `components/tasks/kanban-board.tsx` — Full kanban board (Client)
- `components/tasks/kanban-card.tsx` — Individual task card with variants
- `components/tasks/task-metrics.tsx` — 6-metric grid (Server)
- `components/tasks/cost-breakdown.tsx` — Stacked bar chart + legend (Server)
- `components/tasks/task-output.tsx` — Tabbed output section (Client)
- `components/tasks/task-timeline.tsx` — Vertical execution timeline (Server)
- `components/tasks/task-rating.tsx` — Interactive rating form (Client)

### Data Layer (Phase 11 - Complete)

#### Types & Constants
- `lib/types.ts` — All TypeScript interfaces (Agent, Task, Review, etc.)
- `lib/constants.ts` — Agent colors, nav items, task status configs
- `lib/mock-data.ts` — Mock agents, tasks, details, reviews, sample outputs

#### API & Hooks
- `lib/api-client.ts` — Fetch wrapper (base URL, auth, error handling)
- `lib/hooks/use-agents.ts` — useAgents + useAgent (TanStack Query)
- `lib/hooks/use-tasks.ts` — useTasks + useTask + useCreateTask
- `lib/hooks/use-task-stream.ts` — useTaskStream (SSE simulation)

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
- **Version:** 2.0
- **Last Updated:** 2026-03-14
- **Owner:** Engineering Team
- **Status:** Phase 11 Complete (Marketplace UI Fully Implemented)
