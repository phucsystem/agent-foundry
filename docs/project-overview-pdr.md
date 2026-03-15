# Project Overview & Product Development Requirements (PDR)

## Executive Summary

**Agent Foundry** is a platform for building, deploying, and monetising specialised AI agents as reusable components within workflows and renting them weekly to clients like a staffing agency for AI workers.

**Target Users:** SMBs, agencies, enterprises needing on-demand AI workers (content teams, dev teams, QA teams)

**Value Proposition:** Deploy experts (Coder, PM, Designer, QA) instantly, weekly rental, transparent pricing, no hiring friction.

**Revenue Model:** Tier-based weekly subscriptions ($49–$1,500+/week), usage overages, white-label licensing, SaaS marketplace.

**Current Status:** Phase 1 Complete (all core requirements implemented), Phase 11 Complete (marketplace UI + hired agents feature implemented), Phase 2 In Progress

---

## Implementation Status (as of 2026-03-14)

| Requirement | Implemented | Phase | Notes |
|-------------|-----------|-------|-------|
| REQ-1.1: Agent Interface Contract | ✅ | 1 | TaskInput/TaskResult + validation + guardrails |
| REQ-1.2: Agent Lifecycle | ✅ | 1 | YAML config loader with inheritance |
| REQ-1.3: Multi-Agent Orchestration | ✅ | 1 | WorkflowGraph, TaskRouter, Sequential/Parallel flows |
| REQ-1.4: Tools & Integrations | ✅ | 1 | BaseTool ABC, 9 tools, MCPToolAdapter ready |
| REQ-2.1: PostgreSQL | ✅ | 1 | Schema + Alembic migrations |
| REQ-2.2: pgai (Semantic Memory) | ✅ | 1 | EmbeddingService + semantic search |
| REQ-2.3: Memgraph (Graph DB) | ✅ | 1 | MemgraphService implemented, evaluation pending |
| REQ-3.1: Coder Agent | ✅ | 1 | CodeInterpreter, Terminal, RAG tools ready |
| REQ-3.2: Research Agent | ✅ | 1 | WebSearch, PDFReader, RAG tools ready |
| REQ-3.3: PM/QA/Copywriter Agents | 🔄 | 2 | Architecture ready, implementation pending |
| REQ-4.1: Agent Marketplace | ✅ | 11 | Marketplace + Agent Detail pages, 30+ components, dark mode |
| REQ-4.2: Weekly Hiring UI | ✅ | 11 | Hire agent + My Team page + Agent Detail view |
| REQ-4.3: Task Management | ✅ | 11 | Task creation form + kanban board + detail page + SSE streaming |
| REQ-4.4: Hired Agents Management | ✅ | 2 | Custom instructions, knowledge files, cost breakdown, task history |
| REQ-4.5: Billing Dashboard | 🔄 | 2 | Scaffold ready, Stripe integration pending |
| REQ-4.6: Team Collaboration | ⏳ | 3 | Pending Phase 3 |
| REQ-5.1: REST API | ✅ | 1, 2 | /agents, /agents/hired, /tasks, /health endpoints live |
| REQ-6.1: Langfuse Tracing | ✅ | 1 | LLM tracing + cost tracking |

**Legend:** ✅ = Complete | 🔄 = In Progress | ⏳ = Planned

---

## Functional Requirements

### 1. Agent Framework & Composition

**REQ-1.1:** Agent Interface Contract
- All agents implement `TaskInput` (Pydantic) → `TaskResult` schema
- Schema includes: goal, context, constraints, expected output format
- Framework validates input/output at boundaries (guardrails)
- Support multiple LLM backends (Claude, GPT-4o, Gemini, Ollama) via LiteLLM
- Agent response time < 5min SLA (average), configurable timeout

**REQ-1.2:** Agent Lifecycle
- Agents created from YAML config (id, name, role, goal, backstory, llm, tools, pricing)
- Config loader supports inheritance & overrides
- Version agents (v1, v2, v1.1-experimental)
- Track agent performance metrics (success rate, cost, speed)

**REQ-1.3:** Multi-Agent Orchestration
- Support sequential pipelines (Agent A → B → C)
- Support parallel execution (Agent A, B, C run concurrently)
- Support hierarchical (Manager agent delegates to Specialist agents)
- Use CrewAI manager or LangGraph for routing logic
- Orchestrator returns final output or aggregated results

**REQ-1.4:** Tools & Integrations
- Base tool abstraction (name, description, callable)
- Pre-built: GitHub MCP, Notion MCP, web search, file I/O, code execution
- Support for custom tools via plugin interface
- Tool call logging for audit & cost tracking

### 2. Memory Architecture (Hybrid)

**REQ-2.1:** PostgreSQL (Auth, Billing, Config)
- User accounts & teams
- Subscription tier & usage counters
- Invoice & billing history
- Auth tokens, refresh logic
- Agent configs & versioning
- Audit logs (API calls, agent runs, errors)

**REQ-2.2:** pgai (Semantic Memory & RAG)
- Auto-vectorise session transcripts, documents, conversation history
- Semantic search across all text (agent outputs, user queries, PDFs)
- RAG workflow: retrieve similar past tasks → context for current agent
- Embedding model: OpenAI (default) or local Ollama
- Support ~100K documents MVP (scale to 1M+ later)

**REQ-2.3:** Memgraph (Relational Graph)
- Agent → Task → Project → Client relationships
- Tool usage graph (which agent uses which tools)
- Agent reputation (success rate, cost, speed per client)
- Collaboration graph (agents working together, performance)
- Enable: "find agents similar to this one", "teams that worked well together"
- MVP: evaluate in Phase 1-2 whether it justifies complexity

### 3. Agent Roster (Planned)

#### Phase 1 (Foundation)
- **Coder** (MVP)
  - Goal: Write code, fix bugs, create PRs
  - Tools: Code interpreter, GitHub MCP, bash terminal
  - Output: .md report + PR link or code diff
  - Pricing: $50–100/week (Solo), included in Team/Squad tiers

- **Research** (MVP)
  - Goal: Investigate topics, synthesise reports
  - Tools: Web search, PDF reader, semantic memory (RAG)
  - Output: .md report with citations
  - Pricing: $35–60/week (Solo), included in tiers

#### Phase 2 (Team Composition)
- **PM** (Product Manager)
  - Goal: Create PRDs, break down epics, manage backlog
  - Tools: Notion MCP, Jira/Linear MCP, RAG
  - Output: .md PRD, updated tickets

- **QA** (Quality Assurance)
  - Goal: Run tests, find bugs, write test plans
  - Tools: Playwright/Cypress, test runner, GitHub MCP
  - Output: Test report, bug list, coverage %

- **Copywriter** (Marketing/Content)
  - Goal: Write marketing copy, email, blog posts
  - Tools: CMS APIs, email platforms, brand guidelines RAG
  - Output: Draft copy, optimised for CTR/conversion

#### Phase 3 (Visual Agents)
- **Image Design** (Designer)
  - Goal: Create graphics, mockups, design assets
  - Tools: Stable Diffusion/DALL-E/Midjourney, Figma MCP, PIL
  - Output: PNG/SVG, Figma links

- **Video Design** (Video Editor)
  - Goal: Create promo videos, edit footage
  - Tools: RunwayML/Kling/Sora, FFmpeg, Adobe API
  - Output: MP4, WebM

### 4. User-Facing Features (Frontend)

**REQ-4.1:** Agent Marketplace
- Browse agents (role, tier, pricing, reviews, success rate)
- Filter by specialisation, cost, availability
- View agent details (bio, tools, past outputs)

**REQ-4.2:** Weekly Hiring UI
- Hire agents with plan selection (Solo, Small Team, Full Squad)
- Set weekly budget per hired agent
- My Team page: list all hired agents with status, stats, renewal dates
- Inline settings: update custom instructions, upload/manage knowledge files
- Cancel or rehire agents as needed

**REQ-4.3:** Task Management
- Create task with goal, context, constraints, expected format
- Monitor in-progress task (real-time logs via SSE)
- Download results (PDFs, code, reports)
- Rate & review agent performance
- Assign tasks to specific hired agents (with hire_id)

**REQ-4.4:** Hired Agents Management
- Custom instructions: Add domain-specific prompts per hired agent
- Knowledge files: Upload .md files for context injection (max 5 MB)
- Agent detail view: Full stats, cost breakdown, daily task chart, recent tasks
- Cost overview: Track weekly vs all-time spending against budget
- Task history: View paginated list of tasks for each hired agent
- Agent performance: Success rate, avg cost, avg runtime per hire

**REQ-4.5:** Billing Dashboard
- Weekly cost breakdown by agent
- Usage overage tracking & pricing
- Subscription management (upgrade, downgrade, pause)
- Invoice history & exports

**REQ-4.6:** Team Collaboration
- Share agents within team
- Shared task history & knowledge base
- Approval workflow for high-cost tasks

### 5. API & Integration

**REQ-5.1:** REST API
- `/agents` — List, filter, get details
- `/agents/{id}/hire` — Hire an agent with plan + budget
- `/agents/hired` — List user's hired agents (My Team)
- `/agents/hired/{hire_id}` — Get hired agent detail + stats
- `/agents/hired/{hire_id}/settings` — Update custom instructions
- `/agents/hired/{hire_id}/knowledge` — Upload/delete knowledge files
- `/agents/hired/{hire_id}/tasks` — Get paginated tasks for hired agent
- `/tasks` — Create (with optional hire_id), status, results
- `/subscriptions` — Current tier, usage, billing
- `/teams` — Create, invite, manage members
- Auth: Bearer token + API key options

**REQ-5.2:** Webhooks
- Task completion events (POST to user URL)
- Billing alerts (approaching overage, failed payment)
- Agent performance updates

**REQ-5.3:** SDK
- Python library for programmatic agent hiring
- CLI tool for task submission & monitoring
- Example: `hire-agent --agent coder --weekly --budget $100`

### 6. Quality & Guardrails

**REQ-6.1:** Output Validation
- JSON schema validation for all `TaskResult` outputs
- Mandatory fields: status, output, cost, runtime, reasoning
- Hallucination detection (flag suspicious claims in research)

**REQ-6.2:** Cost Control
- Budget limits per task, per agent, per subscription tier
- Hard stop if cost would exceed limit (agent halts mid-run)
- Transparent cost forecast before task starts

**REQ-6.3:** Rate Limiting & Fair Use
- User quotas: requests/min, concurrent tasks
- Agent quotas: LLM tokens/day, max concurrent runs
- Auto-retry on transient failures (exponential backoff)

**REQ-6.4:** Audit & Compliance
- Log all agent calls: prompt, response, cost, user, timestamp
- Audit trail for billing reconciliation
- GDPR support (data deletion, export)

---

## Non-Functional Requirements

### Performance
- **Task startup:** < 2 seconds (agent initialization)
- **Task runtime:** < 5 minutes (average), < 30 minutes (hard limit)
- **API latency:** p95 < 200ms (non-agent endpoints)
- **Dashboard:** Interactive within 1 second
- **Concurrent tasks:** Scale to 100+ concurrent agents per instance

### Scalability
- Auto-scale backend workers to match task queue depth
- Support 10K users, 1M tasks/month (Phase 3+)
- PostgreSQL: B2ms-D4s instance (scale as needed)
- Redis: Standard tier (1GB+ as queue grows)
- LLM rate limits: Route via LiteLLM to avoid account throttling

### Reliability
- Uptime SLA: 99.5% (Phase 2+)
- Agent failures logged, manual retry option
- Circuit breaker for failing integrations (MCP, LLMs)
- Graceful degradation: downgrade LLM model if quota exceeded
- Backup & restore: daily PostgreSQL snapshots, 7-day retention

### Security
- OAuth2 / API key auth for all endpoints
- TLS 1.2+ for all traffic
- Secrets management: Azure Key Vault
- Agent sandboxing: Code execution in isolated containers (phase 2+)
- RBAC: User roles (admin, manager, viewer, agent)
- Input sanitisation (SQL injection, prompt injection prevention)
- Audit logging: all API calls, agent executions, billing changes

### Observability
- **Langfuse:** LLM tracing, token counting, cost per agent per user
- **OpenTelemetry:** Latency, error rate, queue depth → Azure Monitor
- **PostgreSQL logs:** Slow query detection
- **Application logs:** Structured JSON (agent id, user, task, duration, cost)
- **Alerting:** Error rate spike, quota exhaustion, failed payments

### Maintainability
- Code: Python type hints, Pydantic validation, unit tests (>80% coverage)
- Frontend Testing: Vitest + React Testing Library + MSW (100% passing, 20 test files, 122 tests)
- Docs: Architecture diagrams, agent anatomy, integration guides
- Agent configs: YAML with comments, version control
- Deployment: IaC (Azure Bicep → Terraform), CI/CD automation
- CI/CD: Lint, test, build on every PR (GitHub Actions)

### Accessibility
- Frontend: WCAG 2.1 AA compliance
- Dark mode support
- Mobile-responsive (Tamagui cross-platform)

---

## Technical Constraints

| Constraint | Details |
|------------|---------|
| **Language** | Python 3.11+ (backend), TypeScript (frontend) |
| **Framework** | CrewAI + LangGraph (agents), FastAPI (API), Next.js (frontend) |
| **LLM Routing** | LiteLLM + OpenRouter (one API key, 200+ models) |
| **Primary LLM** | Claude Sonnet 4.6 (reasoning), Claude Haiku (fast tasks) |
| **Deployment** | Azure only (Phase 1), multi-cloud evaluation Phase 3+ |
| **Database** | PostgreSQL 14+ (primary), Memgraph 5+ (graph), Redis 6+ (cache) |
| **Container Runtime** | Docker, Docker Compose (local), Azure Container Apps (prod) |
| **CI/CD** | GitHub Actions, Azure Container Registry |
| **Cost Target** | $210–240 AUD/month (infrastructure, excl. LLM costs) |
| **Latency SLA** | <5min task completion, <200ms API (p95) |
| **Uptime** | 99.5% (Phase 2+) |

---

## Success Metrics

### Functional
- All Phase 1 agents deliver taskable, measurable outputs (code, reports, PRDs)
- Agent success rate: >90% (task output meets user expectation)
- Integration success: >95% (tool calls succeed on first attempt)

### Business
- 50 paid users by end of Phase 2
- 500 tasks/month by end of Phase 3
- Customer retention: >80% (month-to-month)
- ARPU (Average Revenue Per User): $200+/month

### Technical
- API latency p95: <200ms
- Uptime: >99.5%
- LLM cost per task: <$0.50 (average, phase 2+)
- Memory usage: <2GB per concurrent agent

### Quality
- Test coverage: >80% (backend target; frontend achieved at 122 tests, 20 files)
- Code review: 100% of PRs reviewed
- Security: zero critical vulnerabilities
- Agent hallucination rate: <5% (Phase 2+)
- Frontend test pass rate: 100% (all 122 unit tests passing)

---

## Acceptance Criteria

### Phase 1 Complete
- [x] Coder agent executes tasks, produces code/PRs
- [x] Research agent produces markdown reports with citations
- [x] PostgreSQL + pgai + Memgraph running
- [x] Task API endpoints fully functional
- [x] Langfuse integration tracks all LLM calls
- [x] Docker Compose stack deployable locally
- [x] Unit tests >80% coverage
- [x] Frontend testing infrastructure (Vitest, RTL, MSW; 122 tests, 100% passing)
- [x] Documentation complete (architecture, code standards, setup)

### Phase 2 Complete
- [ ] PM, QA, Copywriter agents live
- [ ] Orchestrator routes tasks across agents
- [ ] Notion MCP + GitHub MCP integrated
- [ ] Frontend marketplace UI (browse agents, create tasks)
- [ ] Billing dashboard (cost tracking, tier selection)
- [ ] Internal team using agents daily (dogfood)

### Phase 3 Complete
- [ ] Public signup + billing (Stripe)
- [ ] Image + Video agents functional
- [ ] 50+ paid users
- [ ] Evaluation: keep or replace Memgraph?

### Phase 4 Complete
- [ ] White-label packaging (customer-branded marketplace)
- [ ] Public API + SDK
- [ ] 500+ users
- [ ] Agent A/B testing framework

---

## Dependencies & Risks

### Dependencies
- OpenAI API, Anthropic API, Google Gemini (LLM availability)
- GitHub API (code integrations)
- Notion API (knowledge management)
- Azure infrastructure (deployment, scaling)

### Risks
1. **LLM API costs spike** → Mitigate: route to cheaper models, set hard budgets, monitor via Langfuse
2. **Agent hallucination** → Mitigate: output validation, guardrails, human review for critical tasks
3. **Integration failures (MCP)** → Mitigate: circuit breakers, fallback flows, logging
4. **Memgraph complexity not justified** → Mitigate: evaluate Phase 1-2, remove if not needed
5. **Poor agent quality** → Mitigate: extensive testing, user feedback loop, continuous improvement

---

## Out of Scope (Phase 1-2)

- On-device LLM (Phase 4)
- White-label platform (Phase 4)
- Mobile-first apps (Tamagui Phase 2+)
- Paperclip orchestration (Phase 3+)
- Multi-cloud deployment (Phase 3+)
- Agent marketplace listing (Phase 3)
- Advanced agent training/fine-tuning (Phase 4+)

---

## Document Metadata
- **Version:** 1.2
- **Last Updated:** 2026-03-15
- **Owner:** Product Team
- **Status:** Active (Phases 1, 2, 11 implemented; hired agents feature complete; frontend testing infrastructure complete)
