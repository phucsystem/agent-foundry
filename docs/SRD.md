# System Requirement Definition (SRD) — Agent Foundry Platform

## 1. System Overview

Agent Foundry is a platform for building, deploying, and hiring specialised AI agents on weekly subscriptions. Users browse an agent marketplace, hire agents (Coder, Research, PM, QA, Copywriter), assign tasks, and track results in real time. The platform handles LLM routing, cost control, guardrails, and observability.

**Scope:** User-facing platform — marketplace, hiring, task management, billing. Admin panel covered separately in `docs/admin-srd.md`.

**Target Users:** SMBs, agencies, enterprises needing on-demand AI workers.

**Revenue Model:** Credit-based pay-per-task. Users top up USD credits, agents consume per task at actual LLM cost × 2.0x markup. $5 free credit on signup.

**Current Status:** Phases 1–2 complete (5 agents, marketplace UI, hired agents, auth). Phase 3 (billing, visual agents) in progress.

---

## 2. Actors (User Roles)

| Actor | Description | Access |
|-------|-------------|--------|
| Visitor | Unauthenticated user | Landing page, marketplace (read-only) |
| User (free) | Registered, free tier | Browse agents, hire 1 agent, create tasks (limited budget) |
| User (pro) | Paid subscriber | Hire multiple agents, higher budgets, priority execution |
| User (team) | Team plan | Shared agents, shared task history, approval workflows |
| Super Admin | Platform owner | Admin panel (`/admin/*`), see `admin-srd.md` |
| System | Automated services | Task execution, cost tracking, health monitoring |

**Auth:** Logto Cloud OIDC. Users identified by `tier` in `users` table. JWT tokens via NextAuth.js (frontend) + PyJWKClient validation (backend).

---

## 3. Functional Requirements (FR-xx)

### Authentication & Profile

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-01 | Sign Up | P0 | Register via Logto Cloud (email/social), auto-create `users` row with `free` tier |
| FR-02 | Sign In | P0 | Logto OIDC redirect → JWT cookie → authenticated session |
| FR-03 | Sign Out | P0 | Clear session, redirect to landing page |
| FR-04 | User Profile | P1 | View/edit name, email, tier, API key |
| FR-05 | API Key Management | P2 | Generate/regenerate API key for programmatic access |

### Agent Marketplace

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-10 | Browse Agents | P0 | List all agents with avatar, name, role, weekly price, success rate |
| FR-11 | Filter Agents | P1 | Filter by role, cost range, success rate; sort by popularity/cost/rating |
| FR-12 | Agent Detail | P0 | Full profile: bio, tools, specialisation, stats, sample outputs, reviews, pricing tiers |
| FR-13 | Agent Reviews | P2 | Display user reviews (rating + comment) on agent detail page |

### Agent Hiring

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-20 | Hire Agent | P0 | Add agent to user's team (free). No plan selection, no budget. Creates `hired_agents` row. |
| FR-21 | My Team Page | P0 | List all hired agents with status, plan, budget, renewal date, task count, costs |
| FR-22 | Cancel Hire | P1 | Set hire status to `cancelled`, stop renewal |
| FR-23 | Rehire Agent | P1 | Reactivate previously cancelled hire |
| FR-24 | Custom Instructions | P1 | Add/edit domain-specific prompts per hired agent (injected into agent context) |
| FR-25 | Knowledge Files | P1 | Upload .md files (max 5 MB) per hired agent for context injection |
| FR-26 | Hired Agent Detail | P1 | Full stats: cost overview (weekly/all-time), daily task chart, recent tasks, knowledge files |

### Task Management

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-30 | Create Task | P0 | 5-step wizard: goal → context → agent → budget → review & submit |
| FR-31 | Task Board (Kanban) | P0 | 4 columns: Queued, Running, Completed, Failed; KPI metrics row |
| FR-32 | Real-Time Monitoring | P0 | SSE stream: live progress bars, agent reasoning trace, tool calls, cost accrual |
| FR-33 | Task Results | P0 | Tabbed output: Report, Code, Reasoning Trace, Tool Calls; cost breakdown |
| FR-34 | Task Rating | P1 | 5-star rating + optional comment; feeds agent success rate |
| FR-35 | Task Assignment | P1 | Assign task to specific hired agent (with hire_id) for context injection |
| FR-36 | Task Retry | P2 | Re-run failed task with same/modified parameters |
| FR-37 | Task Download | P2 | Download results as PDF, Markdown, or JSON |

### Billing & Credits

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-40 | Billing Dashboard | P1 | Current balance, transaction history, usage breakdown by agent, topup button |
| FR-41 | Credit Topup | P1 | Add credits via Stripe one-time Checkout. Min $5. Presets: $5, $10, $25, $50, $100, custom |
| FR-42 | Stripe Integration | P1 | One-time payment sessions, webhook handler for payment confirmation |
| FR-43 | Usage Tracking | P1 | Track per-task cost (actual LLM cost × 2.0), running balance, cost breakdown by agent |
| FR-44 | Transaction History | P2 | List all credit transactions: topups, deductions, refunds, signup bonus |
| FR-45 | Pre-flight Balance Check | P0 | Estimate task cost before execution, reject if insufficient balance (HTTP 402) |
| FR-46 | Free Signup Credit | P1 | Auto-grant $5.00 credit on new user registration, no credit card required |
| FR-47 | Low Balance Alert | P2 | Warn when balance < $1.00, block new tasks at $0.00, in-progress tasks finish |
| FR-48 | Task Refund | P1 | Auto-refund 100% on system errors, no refund on user errors |
| FR-49 | Per-Task Budget Cap | P2 | Optional max spend per task (USD), task aborts if cap exceeded |

### Landing & Onboarding

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-50 | Landing Page | P1 | Value proposition, agent carousel, pricing table, CTA (Sign Up) |
| FR-51 | Onboarding Flow | P2 | First-run checklist: create first task, hire first agent, explore results |

### API Access

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-60 | REST API | P0 | All CRUD operations available via authenticated API |
| FR-61 | SSE Streaming | P0 | Real-time task progress via Server-Sent Events |
| FR-62 | Webhooks | P2 | Task completion, billing alerts push to user-configured URLs |
| FR-63 | Python SDK | P3 | `from agent_foundry import HireAgent` + CLI tool |

---

## 4. Screen List (S-xx)

| ID | Screen Name | Route | Description |
|----|-------------|-------|-------------|
| S-00 | Landing Page | / | Public landing: hero, agent carousel, pricing, CTA |
| S-01 | Sign In | /auth/signin | Logto OIDC redirect |
| S-02 | Agent Marketplace | /agents | Browse all agents, filter/sort, 4-column grid |
| S-03 | Agent Detail | /agents/[id] | Hero, stats, sample outputs, reviews, pricing tiers |
| S-04 | My Team | /agents/hired | Table of hired agents with status, budget, actions |
| S-05 | Hired Agent Detail | /agents/hired/[hireId] | Cost overview, task chart, recent tasks, knowledge files |
| S-06 | Task Board | /tasks | Kanban: Queued/Running/Completed/Failed + KPI row |
| S-07 | Create Task | /tasks/new | 5-step wizard: goal → context → agent → budget → review |
| S-08 | Task Detail | /tasks/[id] | Metrics, cost breakdown, tabbed output, timeline, rating |
| S-09 | Billing | /billing | Balance card, topup button, transaction history, usage chart by agent |
| S-10 | User Profile | /settings | Name, email, tier, API key management |

---

## 5. Entity List (E-xx)

| ID | Entity | Source Table | Description |
|----|--------|-------------|-------------|
| E-01 | User | `users` | Account: id, email, name, tier, api_key, created_at |
| E-02 | AgentConfig | `agent_configs` | Agent definitions: agent_id, name, role, config_yaml, version |
| E-03 | HiredAgent | `hired_agents` | Weekly subscription: user_id, agent_id, status, plan, budget, custom_instructions |
| E-04 | KnowledgeFile | `knowledge_files` | Context files: hire_id, file_name, size_bytes, content_text |
| E-05 | Task | `tasks` | Task execution: user_id, agent_id, hire_id, goal, status, cost_usd, output_data |
| E-06 | AgentMemory | `agent_memories` | Semantic memory: agent_id, chunk_text, embedding (vector 1536) |
| E-07 | CreditTransaction | `credit_transactions` | Credit audit log: user_id, type (topup/deduction/refund/signup_bonus), amount_cents, balance_after_cents, reference_id, description |

### Entity Relationships

```
User (E-01) ──1:N──> HiredAgent (E-03) ──1:N──> KnowledgeFile (E-04)
User (E-01) ──1:N──> Task (E-05)
User (E-01) ──1:N──> CreditTransaction (E-07)
HiredAgent (E-03) ──1:N──> Task (E-05)
AgentConfig (E-02) ──1:N──> HiredAgent (E-03)
AgentConfig (E-02) ──1:N──> Task (E-05)
AgentConfig (E-02) ──1:N──> AgentMemory (E-06)
Task (E-05) ──0:1──> CreditTransaction (E-07)
```

---

## 6. Non-Functional Requirements

### Performance
- Task startup: < 2s (agent initialization)
- Task runtime: < 5 min average, < 30 min hard limit
- API latency: p95 < 200ms (non-agent endpoints)
- Dashboard: interactive within 1s
- Concurrent tasks: scale to 100+ agents per instance

### Scalability
- Auto-scale Celery workers to match queue depth
- Support 10K users, 1M tasks/month (Phase 3+)
- PostgreSQL: B2ms→D4s (scale as needed)
- Redis: Standard tier (1GB+)

### Security
- Logto Cloud OIDC (OAuth2) for all auth
- TLS 1.2+ for all traffic
- Secrets in Azure Key Vault (prod), .env (dev)
- Agent sandboxing: code execution in isolated containers (Phase 2+)
- Input sanitisation (SQL injection, prompt injection via InputGuardrail)
- Audit logging: all API calls, agent executions, billing changes

### Reliability
- Uptime SLA: 99.5% (Phase 2+)
- Circuit breaker for failing integrations (MCP, LLMs)
- Graceful degradation: downgrade LLM model if quota exceeded
- Daily PostgreSQL snapshots, 7-day retention

### Observability
- Langfuse: LLM tracing, token counting, cost per agent per user
- OpenTelemetry: latency, error rate, queue depth → Azure Monitor
- Structured JSON logs (agent_id, task_id, user_id, cost, duration)

### Accessibility
- WCAG 2.1 AA compliance
- Dark mode support (default + toggle)
- Mobile-responsive (Tailwind breakpoints)

---

## 7. API Endpoints

### Auth

| Method | URL | FR | Description |
|--------|-----|----|-------------|
| GET | /auth/signin | FR-02 | Logto OIDC sign-in redirect |
| POST | /auth/callback | FR-02 | Logto OIDC callback handler |
| GET | /users/me | FR-04 | Authenticated user profile |

### Agents

| Method | URL | FR | Description |
|--------|-----|----|-------------|
| GET | /agents | FR-10 | List agents with filters (role, cost, success rate) |
| GET | /agents/{id} | FR-12 | Agent public profile + stats |

### Hiring

| Method | URL | FR | Description |
|--------|-----|----|-------------|
| POST | /agents/{agent_id}/hire | FR-20 | Hire agent (plan + budget) |
| GET | /agents/hired | FR-21 | List user's hired agents (My Team) |
| GET | /agents/hired/{hire_id} | FR-26 | Hired agent detail + stats |
| PUT | /agents/hired/{hire_id}/settings | FR-24 | Update custom instructions |
| DELETE | /agents/hired/{hire_id} | FR-22 | Cancel hire |
| POST | /agents/hired/{hire_id}/rehire | FR-23 | Reactivate cancelled hire |
| POST | /agents/hired/{hire_id}/knowledge | FR-25 | Upload knowledge file |
| DELETE | /agents/hired/{hire_id}/knowledge/{file_id} | FR-25 | Delete knowledge file |
| GET | /agents/hired/{hire_id}/tasks | FR-26 | Recent tasks for hired agent |

### Tasks

| Method | URL | FR | Description |
|--------|-----|----|-------------|
| POST | /tasks | FR-30 | Create + enqueue task (with optional hire_id) |
| GET | /tasks/{id} | FR-33 | Task status + results |
| GET | /tasks/{id}/stream | FR-32 | SSE stream for live progress |

### Billing

| Method | URL | FR | Description |
|--------|-----|----|-------------|
| GET | /billing/balance | FR-40 | Current credit balance |
| POST | /billing/topup | FR-41 | Create Stripe Checkout session for one-time payment |
| POST | /billing/webhook | FR-42 | Stripe webhook handler (payment confirmation) |
| GET | /billing/transactions | FR-44 | Paginated transaction history |

### Health

| Method | URL | FR | Description |
|--------|-----|----|-------------|
| GET | /health | — | Service + dependency health check |

---

## 8. Traceability Matrix

| FR | Screen | API Endpoint | Entity |
|----|--------|-------------|--------|
| FR-01 | S-01 | Logto Cloud (external) | E-01 |
| FR-02 | S-01 | GET /auth/signin, POST /auth/callback | E-01 |
| FR-04 | S-10 | GET /users/me | E-01 |
| FR-10 | S-02 | GET /agents | E-02 |
| FR-11 | S-02 | GET /agents?role=&cost_min=&cost_max= | E-02 |
| FR-12 | S-03 | GET /agents/{id} | E-02 |
| FR-20 | S-03 | POST /agents/{agent_id}/hire | E-03 |
| FR-21 | S-04 | GET /agents/hired | E-03 |
| FR-22 | S-04 | DELETE /agents/hired/{hire_id} | E-03 |
| FR-23 | S-04 | POST /agents/hired/{hire_id}/rehire | E-03 |
| FR-24 | S-04, S-05 | PUT /agents/hired/{hire_id}/settings | E-03 |
| FR-25 | S-05 | POST/DELETE .../knowledge | E-04 |
| FR-26 | S-05 | GET /agents/hired/{hire_id} | E-03, E-04, E-05 |
| FR-30 | S-07 | POST /tasks | E-05 |
| FR-31 | S-06 | GET /tasks (filtered by status) | E-05 |
| FR-32 | S-06, S-08 | GET /tasks/{id}/stream | E-05 |
| FR-33 | S-08 | GET /tasks/{id} | E-05 |
| FR-34 | S-08 | (future endpoint) | E-05 |
| FR-35 | S-07 | POST /tasks (with hire_id) | E-03, E-05 |
| FR-40 | S-09 | GET /billing/balance | E-01, E-07 |
| FR-41 | S-09 | POST /billing/topup | E-01, E-07 |
| FR-42 | — | POST /billing/webhook | E-01, E-07 |
| FR-43 | S-08, S-09 | GET /billing/balance | E-05, E-07 |
| FR-44 | S-09 | GET /billing/transactions | E-07 |
| FR-45 | S-07 | POST /tasks | E-01, E-05 |
| FR-46 | S-01 | POST /auth/callback | E-01, E-07 |
| FR-47 | S-06, S-09 | GET /billing/balance | E-01 |
| FR-48 | S-08 | — (system) | E-05, E-07 |
| FR-49 | S-07 | POST /tasks | E-05 |
| FR-50 | S-00 | — (static page) | — |

---

## 9. Dependencies & Risks

### Dependencies
- Logto Cloud (auth provider availability)
- LLM APIs: Anthropic, OpenRouter, DeepSeek (quota, pricing changes)
- Stripe Checkout (one-time payments, credit topup)
- GitHub/Notion APIs (MCP integrations)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM API costs spike | High | Critical | Langfuse monitoring, route to cheaper models, hard budget limits |
| Agent hallucination >5% | Medium | High | Output validation, guardrails, human review for critical tasks |
| Logto Cloud downtime | Low | High | JWT tokens cached locally; mock auth for dev |
| Stripe integration bugs | Low | High | Sandbox testing, webhook replay |
| Low customer adoption | Low | Critical | Internal dogfood, feature feedback loop, iterative UI |

---

## 10. Out of Scope

- Admin panel (see `docs/admin-srd.md`)
- On-device LLM / mobile app (Phase 4)
- White-label packaging (Phase 4)
- Multi-cloud deployment (Phase 3+)
- Agent training / fine-tuning (Phase 4+)
- Team collaboration features (Phase 3)

---

## Document Metadata
- **Version:** 1.0
- **Created:** 2026-03-15
- **Owner:** Product (Solo Founder)
- **Status:** Draft — pending GATE 2 validation
- **Admin SRD:** docs/admin-srd.md
- **PDR Reference:** docs/project-overview-pdr.md
