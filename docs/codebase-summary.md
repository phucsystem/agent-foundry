# Codebase Summary

## Overview

Agent Foundry is a full-stack AI agent platform built with Python/FastAPI (backend), Next.js/React (frontend), and PostgreSQL/Redis/Memgraph infrastructure. As of 2026-03-14, the codebase spans 92K lines (backend Python) + 41K lines (frontend TypeScript) across 9 backend modules and 5 frontend screens with 30+ React components.

**Completion Status:** Phases 1, 2, 6, 7, 8, 9, 10, 11 implemented. Foundation (Phases 3–5, 12–20) in progress.

---

## Backend Architecture (92K lines, 9 modules)

### 1. Agents Module (437 lines, 8 files)

**Purpose:** Core agent framework, registry, configuration loading, concrete agent implementations.

**Key Classes:**
- `BaseAgent` (ABC) — Abstract base for all agents; `execute(task: TaskInput) -> TaskResult`
- `CoderAgent` — Specializes in code generation, bug fixes, PR creation
- `ResearcherAgent` — Specializes in research, report synthesis, knowledge extraction
- `AgentRegistry` (singleton) — Registers agents by ID; lazy-loads from YAML configs
- `AgentConfig` (Pydantic) — Agent metadata (id, name, role, goal, backstory, llm config, tools, guardrails, version)
- `ConfigLoader` — Parses YAML (`base.yaml` inheritance + overrides); supports single-level inheritance

**Files:**
- `base.py` (150 lines) — BaseAgent ABC, TaskInput/TaskResult Pydantic models
- `coder.py` (80 lines) — CoderAgent concrete implementation
- `researcher.py` (75 lines) — ResearcherAgent concrete implementation
- `config.py` (120 lines) — AgentConfig, LLMConfig, ToolConfig Pydantic schemas
- `loader.py` (70 lines) — YAML config loader with inheritance
- `registry.py` (85 lines) — AgentRegistry singleton with caching
- `exceptions.py` (65 lines) — AgentError, GuardrailViolation exception hierarchy
- `configs/` (3 YAML files) — base.yaml, coder.yaml, researcher.yaml

**Integration Points:**
- Task orchestrator routes to agents via registry
- Guardrails validate inputs/outputs for each agent
- Tools resolved via ToolRegistry before execution

---

### 2. Tools Module (736 lines, 10 files)

**Purpose:** Tool abstraction, built-in tools, MCP adapter, tool registry.

**Key Classes:**
- `BaseTool` (ABC) — All tools inherit; `execute(params: dict) -> str`
- `SimpleTool` (@tool decorator) — Lightweight tool wrapper for CrewAI
- `MCPToolAdapter` — Wraps MCP tools (GitHub, Notion) with caching; lazy-loads via MCPServer
- `ToolRegistry` (singleton) — Registers tools; provides tool list to agents
- `CodeInterpreter` — Python + JavaScript execution (sandboxed)
- `Terminal` — Bash execution with safeguards (allowed commands list)
- `WebSearch` — Stub for web search (ready Phase 2)
- `PDFReader` — Extracts text + metadata from PDFs
- `RAGSearch` — Semantic search via pgai (retrieves similar past outputs)
- `GitHubMCP` — Stub for GitHub MCP (create PRs, read repos) - Phase 2
- `ToolRegistry` — Central registry; `get_crewai_tools()` returns CrewAI-compatible tools

**Files:**
- `base.py` (120 lines) — BaseTool ABC, SimpleTool wrapper
- `code_interpreter.py` (180 lines) — Python/JS execution with sandboxing
- `terminal.py` (140 lines) — Bash tool with allowed-commands safeguard
- `web_search.py` (85 lines) — Web search stub (ready for Phase 2)
- `pdf_reader.py` (110 lines) — PDF extraction + metadata
- `rag_search.py` (130 lines) — pgai semantic search
- `github_mcp.py` (95 lines) — GitHub MCP stub
- `mcp_adapter.py` (140 lines) — MCP tool wrapper + caching
- `registry.py` (85 lines) — ToolRegistry singleton
- `__init__.py` (50 lines) — Exports + tool initialization

**Integration Points:**
- All tools support CrewAI's `Tool` wrapper interface
- Tools log execution + cost to Langfuse
- Tool output validated by OutputGuardrail

---

### 3. Guardrails Module (149 lines, 5 files)

**Purpose:** Input/output validation, cost control, safety enforcement.

**Key Classes:**
- `GuardrailBase` (ABC) — `async validate_input(task)` + `async validate_output(result)`
- `GuardrailPipeline` — Composes guardrails; runs sequentially; halts on failure
- `InputGuardrail` — Detects prompt injection (regex patterns), validates required fields
- `CostGuardrail` — Pre-flight budget check (before execution); cost warning (after execution)
- `OutputGuardrail` — Validates TaskResult schema, token count, cost bounds

**Files:**
- `base.py` (45 lines) — GuardrailBase ABC, GuardrailPipeline composition
- `input.py` (40 lines) — InputGuardrail (prompt injection, field validation)
- `cost.py` (50 lines) — CostGuardrail (budget enforcement)
- `output.py` (38 lines) — OutputGuardrail (schema + cost validation)
- `__init__.py` (10 lines) — Exports

**Integration Points:**
- Pipeline runs before + after agent execution (task executor)
- Raises GuardrailViolation subclasses (BudgetExceededError, OutputValidationError, InputValidationError)

---

### 4. Orchestrator Module (356 lines, 5 files)

**Purpose:** Multi-agent workflow routing, sequential/parallel execution, task state management.

**Key Classes:**
- `WorkflowGraph` — Graph-based workflow definition (nodes = agents, edges = data flow)
- `TaskRouter` — Routes incoming tasks to appropriate agent(s) based on goal/type
- `SequentialFlow` — Agent A → B → C; output of A feeds input to B
- `ParallelFlow` — Run agents A, B, C concurrently; aggregate results
- `WorkflowState` (Pydantic) — Task state during execution (current_agent, results, errors, metadata)

**Files:**
- `graph.py` (120 lines) — WorkflowGraph definition + traversal
- `router.py` (95 lines) — TaskRouter with rule-based + LLM-based routing
- `flows.py` (85 lines) — SequentialFlow + ParallelFlow execution
- `state.py` (60 lines) — WorkflowState Pydantic model
- `__init__.py` (15 lines) — Exports

**Integration Points:**
- FastAPI POST /tasks delegates to TaskRouter
- Router returns TaskRouter → SequentialFlow/ParallelFlow
- Flows instantiate agents via AgentRegistry, execute, aggregate results

---

### 5. Observability Module (260 lines, 5 files)

**Purpose:** LLM tracing (Langfuse), structured logging, telemetry, request ID middleware.

**Key Classes:**
- `LangfuseTracer` (singleton) — Captures LLM calls, agent execution, cost breakdown
- `JSONFormatter` — Structured JSON logs with timestamp, level, service, task_id, agent_id
- `TelemetrySetup` — OpenTelemetry initialization for API latency + error rates
- `RequestIDMiddleware` — Injects request_id into all logs + Langfuse traces
- `LoggingConfig` — Logger setup with handlers + formatters

**Files:**
- `langfuse_client.py` (95 lines) — LangfuseTracer singleton + cost tracking
- `logging_config.py` (80 lines) — JSONFormatter + logger setup
- `telemetry.py` (70 lines) — OpenTelemetry metrics + spans
- `middleware.py` (40 lines) — RequestIDMiddleware for FastAPI
- `__init__.py` (15 lines) — Exports

**Integration Points:**
- All CrewAI agent calls wrapped in Langfuse traces
- Task executor publishes cost + duration to Langfuse
- Frontend receives task_id for real-time SSE monitoring

---

### 6. Database Module (187 lines, 3 files)

**Purpose:** PostgreSQL connection pooling, Pydantic record models, schema definition.

**Key Classes:**
- `AsyncPGPool` — asyncpg connection pool manager
- `TaskRecord`, `UserRecord`, `AgentConfigRecord` (Pydantic) — ORM-like models for DB queries
- `SCHEMA_SQL` (literal SQL) — DDL for users, tasks, agents_config, audit_log tables

**Files:**
- `connection.py` (95 lines) — AsyncPGPool + initialization
- `models.py` (85 lines) — Pydantic record models
- `__init__.py` (10 lines) — Exports

**Integration Points:**
- Task executor stores TaskResult in tasks table
- Agent registry caches agent configs from agents_config table
- Audit logs all API calls + agent executions

---

### 7. Memory Module (383 lines, 6 files)

**Purpose:** Hybrid memory: PostgreSQL (structured), pgai (semantic), Memgraph (relational), session cache (short-term).

**Key Classes:**
- `PgaiMemoryService` — Semantic search via pgvector (embeddings); retrieves similar past tasks
- `MemgraphService` — Graph queries (Agent → Task → Project relationships); agent metrics
- `SessionMemory` — Short-term in-memory cache (task context, conversation history)
- `EmbeddingService` — Generates embeddings via OpenAI API (or local Ollama)
- `MemoryRouter` — Routes queries to appropriate memory backend (pgai for semantic, Memgraph for graph, session for short-term)

**Files:**
- `pgai.py` (120 lines) — PgaiMemoryService + semantic search
- `memgraph.py` (95 lines) — MemgraphService + graph queries
- `session.py` (70 lines) — SessionMemory cache manager
- `embeddings.py` (75 lines) — EmbeddingService + embedding generation
- `router.py` (50 lines) — MemoryRouter (query dispatch)
- `__init__.py` (15 lines) — Exports

**Integration Points:**
- Research agent uses RAGSearch tool (calls PgaiMemoryService)
- Agents query SessionMemory during execution for context
- Memgraph available for Phase 2+ analytics (agent success rates, collaboration graphs)

---

### 8. Workers Module (195 lines, 5 files)

**Purpose:** Celery async task execution, progress publishing, callbacks, retry logic.

**Key Classes:**
- `CeleryApp` — Celery app configured with Redis backend
- `execute_agent_task` (Celery task) — Main worker task; orchestrates guardrails, agent execution, result storage
- `ProgressPublisher` — Publishes task progress to Redis pub/sub (consumed by SSE endpoint)
- `TaskCallbacks` — on_success, on_failure, on_retry handlers
- `ExponentialBackoffRetry` — Retry with exponential backoff (max 3 retries)

**Files:**
- `celery_app.py` (85 lines) — Celery app setup + configuration
- `tasks.py` (95 lines) — execute_agent_task implementation
- `progress.py` (40 lines) — ProgressPublisher (Redis pub/sub)
- `callbacks.py` (35 lines) — TaskCallbacks (on_success, on_failure, on_retry)
- `__init__.py` (10 lines) — Exports

**Execution Flow:**
1. FastAPI POST /tasks enqueues task to Redis
2. Worker dequeues task
3. Worker runs InputGuardrail (prompt injection check)
4. Worker instantiates agent from registry
5. Worker executes agent (LLM + tools)
6. Worker runs OutputGuardrail (schema validation)
7. Worker stores TaskResult in PostgreSQL
8. Worker publishes SSE event (frontend live update)
9. On failure, retry with exponential backoff (max 3 retries)

---

### 9. API Module (340 lines, 10 files)

**Purpose:** FastAPI app factory, routers, middleware, auth, error handling.

**Key Routes:**
- `GET /health` — Readiness probe (service + dependency checks)
- `GET /agents` — List all agents with filters (role, cost range, success rate)
- `GET /agents/{id}` — Get single agent details
- `POST /tasks` — Create + enqueue task (validates TaskInput, returns task_id)
- `GET /tasks/{id}` — Get task status + results (stored in PostgreSQL)
- `GET /tasks/{id}/stream` — SSE stream for live task progress (via Redis pub/sub)
- `GET /users/me` — Get authenticated user profile (requires Logto token)
- `POST /auth/callback` — Logto OIDC callback handler
- `GET /auth/signin` — Logto sign-in redirect

**Files:**
- `main.py` (95 lines) — FastAPI app factory, middleware setup, route registration
- `routers/health.py` (35 lines) — GET /health endpoint
- `routers/agents.py` (65 lines) — GET /agents, GET /agents/{id}
- `routers/tasks.py` (85 lines) — POST /tasks, GET /tasks/{id}, SSE stream
- `routers/auth.py` (50 lines) — POST /auth/callback, GET /auth/signin
- `routers/users.py` (40 lines) — GET /users/me (profile)
- `auth/logto.py` (60 lines) — Logto Cloud OIDC client
- `auth/jwt_handler.py` (50 lines) — JWT token verification via PyJWKClient
- `auth/api_key.py` (40 lines) — API key manager + validation
- `auth/dependencies.py` (35 lines) — FastAPI dependency injection for auth

**Middleware:**
- CORS (whitelist frontend origin)
- RequestID injection (for tracing)
- Error handling (500 errors logged to Langfuse)
- Rate limiting (per API key, via RateLimiter)
- Auth middleware (JWT + optional MOCK_AUTH bypass)

---

## Frontend Architecture (41K lines, 30+ components, 5 pages)

### Page Structure (App Router)

**5 Pages (Server Components by default, Client Islands for interactivity):**

1. **`app/agents/page.tsx`** (Phase 11)
   - Marketplace listing all agents
   - Server Component; filters via Client Island
   - 4-column responsive grid
   - Agent cards show: avatar, name, role, cost, success rate, 2 sample outputs, reviews
   - Filter by role, cost range, success rate

2. **`app/agents/[id]/page.tsx`** (Phase 11)
   - Agent detail page
   - Hero section: agent bio, tools, specialisation
   - Stats bar: success rate, avg cost, avg runtime, total tasks
   - Sample outputs grid (2-col)
   - Reviews section (3 reviews)
   - Pricing tiers (3: Solo, Small Team, Full Squad)
   - Mobile sticky footer with Hire button

3. **`app/tasks/page.tsx`** (Phase 11)
   - Task Board (Kanban) page
   - 4 columns: Queued, Running, Completed, Failed
   - KPI metrics row: Total Tasks, Success Rate, Avg Duration, Total Cost
   - Filter bar (search, agent, priority, date range) — visual only for MVP
   - Real-time progress bars for running tasks
   - Cost + duration metrics for completed tasks
   - Error messages + retry buttons for failed tasks

4. **`app/tasks/new/page.tsx`** (Phase 11)
   - Task creation wizard (5-step form)
   - Step 1: Task goal (textarea with character counter)
   - Step 2: Context documents (drop zone, visual only)
   - Step 3: Agent selection (radio grid, 3 agents)
   - Step 4: Budget slider ($10–$500)
   - Step 5: Review table + Submit
   - Form submission navigates to `/tasks`

5. **`app/tasks/[id]/page.tsx`** (Phase 11)
   - Task detail/results page
   - Task header card: status, priority, Re-run/Share buttons
   - 6-metric grid: Duration, Total Cost, Tokens, Tool Calls, LLM Model, Retries
   - Cost breakdown bar (input/output/tools segments)
   - Task output section (tabs: Report, Code, Reasoning Trace, Tool Calls)
   - Execution timeline (vertical line, 6 colored entries)
   - Rating form (5-star interactive)
   - Bottom actions (Hire Again, Back to Board, Browse Agents)

### Component Breakdown (30+ components)

**Layout Components (4):**
- `components/layout/sidebar.tsx` — Navigation with active link detection
- `components/layout/theme-toggle.tsx` — Dark mode toggle with localStorage persistence
- `components/layout/providers.tsx` — QueryClientProvider wrapper
- `components/layout/mobile-nav.tsx` — Mobile-only hamburger menu

**UI Primitives (11):**
- `components/ui/button.tsx` — Primary/secondary/danger, sm/default sizes
- `components/ui/card.tsx` — Card wrapper with shadow + borders
- `components/ui/badge.tsx` — Status badges (success/error/warning/info/neutral)
- `components/ui/input.tsx` — Form inputs, textareas, selects, dropdowns
- `components/ui/avatar.tsx` — Avatar with sizes (sm/default/lg/xl) + gradient backgrounds
- `components/ui/progress-bar.tsx` — Animated progress bar with percentage label
- `components/ui/pagination.tsx` — Page number buttons with active state
- `components/ui/search-bar.tsx` — Search input + filter button group
- `components/ui/kpi-card.tsx` — KPI metric card (label, value, change indicator)
- `components/ui/star-rating.tsx` — Star rating display + interactive mode
- `components/ui/tabs.tsx` — Tab group with active indicator

**Agent Components (6):**
- `components/agents/agent-card.tsx` — Marketplace card (Server Component)
- `components/agents/agent-filters.tsx` — Search + filter bar (Client Island)
- `components/agents/agent-hero.tsx` — Detail page hero section
- `components/agents/agent-stats-bar.tsx` — 4-metric stats grid
- `components/agents/agent-reviews.tsx` — Reviews list with avatars
- `components/agents/agent-pricing.tsx` — 3-tier pricing grid

**Task Components (9):**
- `components/tasks/task-form.tsx` — 5-step task creation form (Client Island)
- `components/tasks/task-form-steps.tsx` — Step indicator (1-5 numbered steps)
- `components/tasks/kanban-board.tsx` — Full kanban board (Client Island)
- `components/tasks/kanban-card.tsx` — Individual task card with variants
- `components/tasks/task-metrics.tsx` — 6-metric grid (Server Component)
- `components/tasks/cost-breakdown.tsx` — Stacked bar chart + legend
- `components/tasks/task-output.tsx` — Tabbed output section (Client Island)
- `components/tasks/task-timeline.tsx` — Vertical execution timeline
- `components/tasks/task-rating.tsx` — Interactive rating form (Client Island)

### Data Layer (TypeScript)

**Types & Constants (`lib/types.ts`):**
- `Agent` interface (id, name, role, weeklyPrice, successRate, tools, specialisation)
- `Task` interface (id, agentId, status, goal, cost, duration, createdAt)
- `Review` interface (author, rating, comment, date)
- `TaskOutput` interface (report, code, trace, toolCalls)

**Mock Data (`lib/mock-data.ts`):**
- 7 agents (Coder, Research, PM, QA, Copywriter, Image Designer, Video Designer)
- 12 sample tasks (running, completed, failed states)
- 3 reviews per agent
- Sample outputs (markdown, code, traces)

**API Client (`lib/api-client.ts`):**
- Fetch wrapper with base URL, auth headers, error handling
- `fetchAgents()`, `fetchAgent(id)`, `fetchTasks()`, `fetchTask(id)`, `createTask(input)`, `streamTask(id)`

**Custom Hooks (`lib/hooks/`):**
- `useAgents()` + `useAgent(id)` — TanStack Query hooks
- `useTasks()` + `useTask(id)` + `useCreateTask()` — Task hooks
- `useTaskStream(id)` — SSE simulation hook (polls every 2s)

### Styling & Design System

**Framework:** Tailwind CSS v4 + @theme design tokens

**Dark Mode:**
- `@custom-variant dark` for dark-mode classes
- Colors: slate-900 (dark bg), white (light bg)
- Toggle persisted to localStorage
- Applied globally via Tailwind + React context

**Design Tokens (@theme):**
- Colors: brand-primary, brand-secondary, danger, success, warning
- Spacing: 4px unit (gap-4, p-4, etc.)
- Fonts: system font stack (Inter fallback)
- Shadows: sm/md/lg variants

**Bundle Size:** 102KB (first load JS)

---

## Tech Stack Summary

### Backend (Python)
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | FastAPI | 0.104+ |
| **ASGI** | Uvicorn | 0.24+ |
| **Validation** | Pydantic | v2 |
| **Agent Orchestration** | CrewAI | 1.10+ |
| **Workflow Graphs** | LangGraph | 0.3+ |
| **Task Queue** | Celery | 5.3+ |
| **Queue Backend** | Redis | 7.0+ |
| **Database** | PostgreSQL | 15+ |
| **Vector Search** | pgvector | 0.5+ |
| **Graph DB** | Memgraph | 2.10+ |
| **LLM Routing** | LiteLLM | Latest |
| **LLM Tracing** | Langfuse | 2.0+ |
| **Observability** | OpenTelemetry | Latest |

### Frontend (TypeScript)
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 15 (App Router) |
| **UI Library** | React | 19 |
| **Language** | TypeScript | 5.3+ |
| **Styling** | Tailwind CSS | v4 |
| **State (Server)** | TanStack Query | v5 |
| **State (Global)** | Zustand | Latest |
| **Cross-platform** | Tamagui | 1.10+ (Phase 2) |
| **Testing** | Vitest | Latest |
| **E2E Tests** | Playwright | Latest |

### Infrastructure
| Component | Technology | Notes |
|-----------|-----------|-------|
| **Local Dev** | Docker Compose | 10 services: Traefik, Postgres, Redis, Memgraph, Memgraph Lab, LiteLLM, Backend, Worker, Frontend, Langfuse |
| **Reverse Proxy** | Traefik | v3 |
| **Production** | Azure Container Apps | Scale to 10 instances |
| **Storage** | Azure PostgreSQL Flexible | Auto-pause when idle |
| **Cache** | Azure Redis Standard | 1GB tier |
| **CDN** | Azure Front Door | DDoS protection |
| **Static Frontend** | Azure Static Web Apps | Free tier |
| **IaC** | Azure Bicep | (Phase 2) |
| **CI/CD** | GitHub Actions | Lint, test, build (Phase 7 complete) |
| **Auth** | Logto Cloud | OIDC provider at https://pk5k15.logto.app |

---

## Key Design Patterns

### 1. Registry Pattern (Agents, Tools)
Both agents and tools use singleton registries with lazy-loading:
- `AgentRegistry.get_agent(id)` — Load from YAML on first call, cache thereafter
- `ToolRegistry.get_tools()` — Return list of registered tools for agent

### 2. Pydantic for Data Contracts
All I/O uses Pydantic models:
- `TaskInput` — User request schema
- `TaskResult` — Agent output schema
- `AgentConfig`, `LLMConfig`, `ToolConfig` — Configuration schemas
- Automatic validation, serialization, OpenAPI schema generation

### 3. Guardrail Pipeline (Composite Pattern)
Multiple guardrails composed into a pipeline:
```python
pipeline = GuardrailPipeline(
    InputGuardrail(),
    CostGuardrail(),
    OutputGuardrail()
)
# Runs each guardrail sequentially; halts on failure
```

### 4. Async/Await Throughout
All I/O operations use async/await:
- Database queries via asyncpg
- External API calls (LiteLLM, Langfuse)
- Redis pub/sub for SSE events
- Never blocks event loop

### 5. YAML Config with Inheritance
Agent configs use single-level inheritance:
- `base.yaml` — Common settings (llm, guardrails)
- `coder.yaml` — Coder-specific overrides
- Parsed by `ConfigLoader` (merges recursively)

### 6. Server Components (Next.js)
Default to Server Components for data fetching:
- `app/agents/page.tsx` — Server Component
- `components/agents/agent-filters.tsx` — Client Island (via `'use client'`)
- Reduces client-side JS bundle

---

## File Organization

### Python Backend
```
backend/
├── agents/              # 437 lines, 8 files
├── tools/               # 736 lines, 10 files
├── guardrails/          # 149 lines, 5 files
├── orchestrator/        # 356 lines, 5 files
├── observability/       # 260 lines, 5 files
├── database/            # 187 lines, 3 files
├── memory/              # 383 lines, 6 files
├── workers/             # 195 lines, 5 files
├── api/                 # 231 lines, 6 files
├── pyproject.toml
├── Dockerfile
└── tests/               # (Pending)
```

### TypeScript Frontend
```
frontend/
├── app/                 # 5 pages + 7 files
│   ├── agents/          # Marketplace + detail
│   ├── tasks/           # Board + detail + create
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing (redirects)
│   └── globals.css      # Global styles
├── components/          # 30+ components
│   ├── layout/          # 4 components
│   ├── ui/              # 11 primitives
│   ├── agents/          # 6 agent-specific
│   └── tasks/           # 9 task-specific
├── lib/
│   ├── types.ts         # TypeScript interfaces
│   ├── constants.ts     # Agent colors, nav items
│   ├── mock-data.ts     # Mock agents, tasks
│   ├── api-client.ts    # Fetch wrapper
│   ├── hooks/           # 5 custom hooks
│   └── utils.ts         # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── Dockerfile
```

---

## Implementation Status

### Complete (Phases 1, 2, 6, 7, 8, 9, 10, 11)
- [x] Backend: agents (5 total), tools, guardrails, orchestrator, observability, database, memory, workers, api
- [x] Frontend: 5 pages, 30+ components, dark mode, Tailwind v4 styling
- [x] Infrastructure: Docker Compose (10 services), Traefik routing, .env template
- [x] Documentation: architecture, code standards, this codebase summary, roadmap
- [x] Auth: Logto Cloud OIDC, JWT handler, API key manager, rate limiter
- [x] CI/CD: GitHub Actions (lint, test, build), Makefile targets
- [x] Agents: Coder, Research, PM, QA, Copywriter with keyword-based routing
- [x] Database: PostgreSQL schema, pgvector semantic memory, Memgraph relational graph
- [x] Observability: Langfuse LLM tracing, OpenTelemetry metrics, structured logging
- [x] LLM Routing: LiteLLM proxy with DeepSeek support (3 models: coder, chat, reasoner)

### In Progress / Pending (Phase 3+)
- [ ] Public signup + Stripe billing engine
- [ ] Image designer agent (Stable Diffusion / DALL-E)
- [ ] Video editor agent (RunwayML / Kling)
- [ ] Memgraph evaluation (Phase 3)
- [ ] White-label packaging (Phase 4)
- [ ] Public API + SDK (Phase 4)

---

## Document Metadata

- **Version:** 4.0 (Phases 1, 2, 6, 7, 8, 9, 10, 11 implementation summary)
- **Last Updated:** 2026-03-14
- **Owner:** Engineering Team
- **Status:** Phases 1–2, 7–11 Complete; Phases 3–5, 12+ Pending
- **Next Update:** After Phase 3 completion (estimated 2026-07-02)
