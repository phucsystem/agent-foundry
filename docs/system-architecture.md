# System Architecture

## Overview

Agent-foundry is a distributed system separating **deterministic flow** (routing, orchestration, validation) from **stochastic intelligence** (LLM reasoning within guardrails). The architecture enables agents to compose into workflows while maintaining cost control, auditability, and safety.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js + Tamagui)               │
│  [Marketplace] → [Task Creator] → [Live Monitor] → [Dashboard] │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP + SSE
┌──────────────────────▼──────────────────────────────────────────┐
│                FastAPI Gateway + Auth                          │
│  [Route /agents] [Route /tasks] [Route /billing] [Route /teams]│
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐  ┌─────▼────┐  ┌─────▼────┐
   │Orchestr.│  │  Task    │  │ Memory & │
   │(CrewAI/ │  │ Executor │  │Guardrails│
   │LangGraph)  │ (Celery) │  │(Validate)│
   └────┬────┘  └─────┬────┘  └─────┬────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
   ┌────▼────┐  ┌─────▼────┐  ┌─────▼──────┐
   │ PostgreSQL │  │  pgai   │  │ Memgraph  │
   │ (Auth,     │  │(Semantic│  │(Relational│
   │ Billing,   │  │ Memory, │  │ Graph)    │
   │ Audit)     │  │ RAG)    │  │           │
   └────────────┘  └─────────┘  └───────────┘
        │             │              │
        └─────────────┼──────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐  ┌────────▼─────┐  ┌────────▼─┐
│ Langfuse│  │ OpenTelemetry│  │Azure     │
│(LLM     │  │(App Metrics) │  │Monitor   │
│Tracing) │  └──────────────┘  └──────────┘
└─────────┘
```

---

## Core Components

### 1. API Gateway (FastAPI)
**Purpose:** Route requests, validate auth, mediate between frontend and workers

**Responsibilities:**
- OAuth2/API key authentication
- Request validation (Pydantic)
- Rate limiting & quota enforcement
- Response marshalling
- SSE connection for live task monitoring
- Error handling & transformation

**Key Routes:**
- `GET /agents` → List agents with filters
- `POST /tasks` → Create task, enqueue
- `GET /tasks/{id}` → Task status & results
- `GET /subscriptions` → User's current tier
- `POST /billing/usage` → Track consumption

**Infrastructure:** Uvicorn ASGI server, runs in Container Apps

---

### 2. Task Orchestrator (CrewAI / LangGraph)
**Purpose:** Coordinate multi-agent workflows, route tasks to agents

**Responsibilities:**
- Parse task input (goal, context, constraints)
- Route to correct agent(s) based on task type
- Handle sequential pipelines (A → B → C)
- Handle parallel execution (A, B, C concurrently)
- Aggregate results for hierarchical workflows (Manager → Specialists)
- Time-box execution (< 5min SLA)
- Error recovery (retry logic, fallback agents)

**Architecture:**
- **CrewAI Manager:** For multi-agent coordination within a task
- **LangGraph:** For complex workflows spanning multiple tasks/agents
- Both share same agent interface (Pydantic TaskInput → TaskResult)

**Data Flow:**
```
TaskInput
  ↓
[Orchestrator determines agent(s)]
  ↓
[Parallel or Sequential Dispatch]
  ↓
[Collect Results]
  ↓
TaskResult (aggregated output)
```

---

### 3. Agent Framework
**Purpose:** Define agent behavior, integrate LLM + tools, enforce guardrails

**Agent Anatomy:**
| Layer | Implementation |
|-------|-----------------|
| **Identity** | YAML config (id, name, role, goal, backstory, specialisation prompt) |
| **Brain** | LLM via LiteLLM (Claude Sonnet, GPT-4o, Gemini, etc.) |
| **Tools** | Base `Tool` class (name, description, async callable) |
| **Memory** | Short-term (session) + pgai semantic search + Memgraph relationships |
| **Guardrails** | Output validation (schema), cost limits, hallucination detection |
| **I/O Contract** | TaskInput → TaskResult (Pydantic) |

**Agent Classes (Inherits from CrewAI Agent):**

```python
class Agent(BaseModel):
    id: str                              # "coder", "research"
    name: str                            # "Code Expert"
    role: str                            # Goal + specialisation
    goal: str                            # What it's trying to achieve
    backstory: str                       # Personality + expertise
    llm_provider: str                    # "claude", "gpt-4o", "gemini", "ollama"
    tools: list[Tool]                    # Available tools
    memory_backend: str                  # "pgai" for semantic search
    guardrails: GuardrailConfig          # Cost limits, validation rules
    pricing_cents_per_run: int           # Estimated cost (used for forecasting)
```

**Tool Interface:**
```python
class Tool(BaseModel):
    name: str
    description: str
    async def execute(self, **kwargs) -> str:
        """Execute tool and return result."""
        pass
```

**Pre-built Tools:**
- `GitHubMCPTool` → Create PRs, read repos, commit code
- `NotionMCPTool` → Read/write Notion pages
- `WebSearchTool` → Search web, return snippets
- `FileIOTool` → Read/write files locally
- `CodeInterpreterTool` → Execute Python/Node.js in sandbox
- `PlaywrightTool` → Browser automation for QA
- `TerminalTool` → Run bash commands (with safeguards)

---

### 4. Task Executor (Celery Workers)
**Purpose:** Execute tasks asynchronously, manage job queue, handle retries

**Responsibilities:**
- Dequeue tasks from Redis
- Instantiate agent from config
- Invoke orchestrator with task input
- Capture output, logs, metrics
- Store result in PostgreSQL
- Publish completion events (Langfuse, webhooks, SSE)
- Retry on transient failures (exponential backoff)
- Hard timeout (30min default)

**Queue Topology:**
```
Task Created (FastAPI)
    ↓
Redis Queue
    ↓
[Celery Workers] (auto-scaled based on queue depth)
    ↓
Orchestrator → Agent → LLM + Tools
    ↓
Result → PostgreSQL + Webhooks + Langfuse
    ↓
Frontend SSE (live updates)
```

---

### 5. Memory & Knowledge Subsystem

#### 5a. PostgreSQL (Structured Data)
**Tables:**
- `users` — Account, tier, API key
- `subscriptions` — Current tier, renewal date, price
- `tasks` — User id, agent, goal, input, output, cost, timestamps
- `tasks_history` — Archive of completed tasks
- `agents_config` — YAML agent definitions (versioned)
- `tools` — Available tools, pricing
- `invoices` — Billing records
- `audit_log` — API calls, agent runs, sensitive actions

**Indexes:**
- `(user_id, created_at)` on tasks (filter by user, sort by time)
- `(agent_id, status)` on tasks (filter by agent, find pending)
- `(user_id, created_at DESC)` on audit_log

#### 5b. pgai (Semantic Memory + RAG)
**Purpose:** Enable agents to search for similar past tasks, documents, examples

**Data:**
- Session transcripts (agent reasoning + output)
- User-uploaded context documents (PDFs, markdown)
- Past task outputs (code, reports, designs)
- Knowledge base (team wiki, brand guidelines, coding standards)

**Workflow:**
1. User uploads context doc or task completes
2. Text split into chunks (max 2K tokens)
3. pgai auto-vectorises via embedding API (OpenAI default, or local Ollama)
4. Stored in `pgvector` column with metadata (task_id, agent_id, user_id, type)
5. Agent retrieves similar chunks via semantic search: "Find past coder tasks with error handling patterns"
6. Chunks injected into agent prompt as context

**Example Query:**
```sql
SELECT chunk_text, similarity
FROM knowledge_embeddings
WHERE user_id = $1 AND type = 'task_output'
ORDER BY embedding <-> pgvector::vector($2)  -- cosine similarity
LIMIT 5;
```

#### 5c. Memgraph (Relational Graph)
**Purpose:** Track agent-task-project-client relationships, enable "find similar agents", reputation scoring

**Node Types:**
- `Agent` (id, name, role, success_rate, avg_cost, avg_duration)
- `Task` (id, goal, status, cost, duration)
- `Project` (id, name, client_id)
- `Client` (id, name, tier)
- `Tool` (name, category)

**Relationships:**
- `Agent -[:EXECUTES]-> Task`
- `Task -[:BELONGS_TO]-> Project`
- `Project -[:BELONGS_TO]-> Client`
- `Agent -[:USES]-> Tool`
- `Agent -[:COLLABORATES_WITH]-> Agent` (agents in same workflow)

**Queries:**
```cypher
// Find agents with similar success rates & skill overlap
MATCH (agent:Agent)-[:USES]->(tool:Tool)<-[:USES]-(similarAgent:Agent)
WHERE agent.id = "coder" AND similarAgent.success_rate > agent.success_rate * 0.8
RETURN similarAgent, count(tool) as skill_overlap
ORDER BY skill_overlap DESC
LIMIT 5;
```

**Evaluation (Phase 1-2):** Determine if relational queries justify complexity. May remove if pgai + PostgreSQL sufficient.

---

### 6. Guardrails & Cost Control

**Input Validation:**
- Pydantic schema validation (required fields, types, constraints)
- Prompt injection detection (reject obvious payloads)
- Budget pre-flight check (will task exceed limit?)

**Output Validation:**
- JSON schema validation (must match expected TaskResult format)
- Hallucination detection (for research agent: flag unverified claims)
- Toxicity filtering (reject harmful outputs)
- Format validation (code is syntactically valid, reports have citations)

**Cost Control:**
- Per-task budget: `max_budget_usd = 10.0`
- Per-agent daily budget: enforced at API level
- Per-user subscription budget: "Solo" tier = $50/week max
- Hard stop: if LLM call would exceed budget, return error (agent halts)
- Forecasting: estimate cost before execution, warn user if approaching limit

**Example Guard:**
```python
class CostGuardrail:
    def validate_before_execution(self, task: TaskInput) -> bool:
        estimated_cost = estimate_llm_cost(task.goal, agent.llm_model)
        if estimated_cost + user_usage_this_week > user_budget:
            raise BudgetExceededError(f"Task would cost ${estimated_cost}, budget remaining ${remaining}")
        return True
```

---

### 7. LLM Routing (LiteLLM + OpenRouter)

**Purpose:** One API key, 200+ models, cost-based automatic routing

**Strategy:**
- **Primary (reasoning):** Claude Sonnet 4.6 for complex tasks
- **Code:** Claude or GPT-4o for coding tasks
- **Fast/cheap:** Claude Haiku or Gemini Flash for simple tasks
- **Fallback:** If quota exceeded, downgrade to cheaper model
- **On-device:** Ollama for low-latency, cost-free execution (local)

**Configuration:**
```python
agent_llm_config = {
    "coder": {
        "primary": "claude-4.6-sonnet",
        "fallback": ["claude-3.5-sonnet", "gpt-4o", "ollama/neural-chat"],
        "budget": 50.0,  # max $ per day
    },
    "research": {
        "primary": "claude-haiku",
        "fallback": ["gemini-2.0-flash"],
        "budget": 20.0,
    }
}
```

**Via LiteLLM:**
```python
import litellm

response = litellm.completion(
    model="openrouter/claude-3.5-sonnet",
    messages=[...],
    budget_limit_dollars=10.0,
)
```

---

### 8. Observability & Tracing

#### Langfuse (LLM Tracing)
**Captures:**
- Every LLM call (prompt, completion, tokens, cost)
- Agent execution traces (start → tool calls → LLM → end)
- Task lifecycle (created → queued → running → completed)
- User → Agent → Cost breakdown

**Enabled for Cost Tracking:**
- Track actual LLM tokens per agent per user
- Alert if token usage >10% above forecast
- Identify expensive agents (may need prompt optimization)

#### OpenTelemetry (App Metrics)
**Captures:**
- API latency (histogram: p50, p95, p99)
- Error rate (by endpoint, by agent)
- Queue depth (tasks waiting)
- Worker utilization (% CPU, memory)
- Database query latency

**Exporters:**
- Azure Monitor (metrics, logs, performance counters)
- Prometheus (optional, for local dev dashboards)

#### Application Logging
**Format:** Structured JSON (fields: timestamp, level, service, agent_id, task_id, user_id, message)

```json
{
  "timestamp": "2026-03-14T10:30:45Z",
  "level": "INFO",
  "service": "task-executor",
  "agent_id": "coder",
  "task_id": "task-abc123",
  "user_id": "user-xyz789",
  "message": "Agent completed task in 2.3s",
  "duration_seconds": 2.3,
  "tokens_used": 1250,
  "cost_usd": 0.45
}
```

---

## Data Flow: Task Execution

**Sequence:**
```
1. User submits task (goal, context, budget)
   → FastAPI validates input (Pydantic)
   → Check user budget & quota
   → Store task in PostgreSQL (status: pending)

2. FastAPI enqueues task to Redis
   → Return task_id to user (polling or SSE)

3. Celery worker dequeues task
   → Load agent config from PostgreSQL
   → Retrieve relevant context from pgai (semantic search)
   → Invoke orchestrator

4. Orchestrator routes to agent(s)
   → Validate agent readiness
   → Invoke LLM with tools available
   → LLM reasons, decides tool calls
   → Tools execute (code, GitHub, Notion, etc.)
   → LLM synthesises output

5. Worker captures result
   → Validate output (guardrails)
   → Store in PostgreSQL (status: completed)
   → Calculate actual cost from Langfuse
   → Update user usage counter
   → Memgraph: record Agent-Task relationship + success_rate
   → Publish event (webhooks, Langfuse, user SSE)

6. Frontend updates in real-time
   → User downloads result (PDF, code, markdown)
   → Reviews cost breakdown
   → Rates agent
```

---

## Deployment Topology (Azure)

```
┌─────────────────────────────────────────────────┐
│        Azure Front Door + CDN                   │
│  (DDoS protection, global routing, caching)     │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
┌───────▼────┐ ┌─▼─────┐ ┌──▼──────────────┐
│Static Web  │ │FastAPI│ │Celery Workers  │
│Apps (Next) │ │ 3x    │ │(auto-scale 1-10)
└───────┬────┘ └─┬─────┘ └────┬───────────┘
        │        │            │
        │        └────────────┤
        │                     │
        └─────────────┬───────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
┌───────▼────┐ ┌─────▼────┐ ┌──────▼────┐
│ PostgreSQL │ │ Redis    │ │ Memgraph  │
│ Flexible   │ │ Cache    │ │ Container │
│ (B2ms)     │ │ Standard │ │ Apps      │
└────────────┘ └──────────┘ └───────────┘
        │             │              │
        └─────────────┼──────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
    ┌───▼────┐                 ┌─────▼──┐
    │Langfuse│                 │Azure   │
    │(Docker)│                 │Monitor │
    └────────┘                 └────────┘
```

**Scaling:**
- FastAPI: Container Apps (1-10 instances based on CPU/memory)
- Celery workers: Container Apps (1-10 instances based on queue depth)
- PostgreSQL: Auto-pause after inactivity; scale storage as data grows
- Redis: Standard tier (1GB, sufficient for MVP queue)
- Memgraph: Container Apps (single instance, evaluate after Phase 2)

**Cost Estimate:** $210–240 AUD/month infrastructure
- Container Apps: $30–50 (auto-scale to zero)
- PostgreSQL: $50–70
- Redis: $15–20
- Static Web Apps: Free
- Front Door: $30–40

---

## Phase Rollout

**Phase 1 (Weeks 1–4):**

**Week 1 — Foundation (COMPLETE)**
- Agent interface contract: `TaskInput`, `TaskResult` Pydantic models
- Base `Agent` ABC + concrete stubs (Coder, Research)
- FastAPI scaffolding with routers (health, agents, tasks)
- Docker Compose stack: Traefik, PostgreSQL, Redis, Memgraph, LiteLLM, Langfuse
- Makefile with development commands
- .env.example template
- Next.js 15 frontend skeleton (layout + landing page)

**Weeks 2–4 (In Progress)**
- Agent framework: tools, guardrails, config loader
- Coder + Research agent integration (tools, LLM invocation)
- PostgreSQL migrations + pgai semantic setup
- Celery worker implementation
- API endpoint implementations
- GitHub Actions CI/CD

**Phase 2 (Weeks 5–8):**
- PM, QA, Copywriter agents added
- Orchestrator (CrewAI manager) routing tasks
- Frontend marketplace UI
- Billing dashboard
- Notion + GitHub MCP fully integrated

**Phase 3 (Weeks 9–14):**
- Image + Video agents
- Memgraph evaluation (keep or remove?)
- Public signup + Stripe billing
- 50+ paid customers

**Phase 4 (Weeks 15+):**
- White-label packaging
- Public API + SDKs
- Agent versioning & A/B testing
- Scale to 500+ users

---

## Document Metadata
- **Version:** 1.1
- **Last Updated:** 2026-03-14
- **Owner:** Architecture Team
- **Status:** Phase 1 Week 1 Complete (Foundation infrastructure verified)
