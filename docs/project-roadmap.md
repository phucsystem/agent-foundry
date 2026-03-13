# Project Roadmap (4-Phase Plan)

## Overview

Agent-foundry is a 15-week initiative split into 4 phases:
1. **Foundation** (Weeks 1–4): Core agent framework, first agents, memory infrastructure
2. **Team Composition** (Weeks 5–8): Multi-agent orchestration, platform UI, internal dogfood
3. **Platform** (Weeks 9–14): Public hiring marketplace, billing, image/video agents
4. **Scale & Sell** (Weeks 15+): White-label, public API, agent marketplace, mobile

---

## Phase 1: Foundation (Weeks 1–4)

### Objectives
- Establish agent interface contract (Pydantic TaskInput/TaskResult)
- Implement base agent framework (wraps CrewAI + memory + guardrails)
- Deploy first 2 agents: Coder, Research
- Set up memory infrastructure (PostgreSQL + pgai + Memgraph)
- Integrate Langfuse for LLM tracing
- Container-based deployment (Docker Compose local, Azure staging)

### Deliverables

#### Week 1: Architecture & Setup
- [x] Python project structure (backend/ layout with agents, memory, api, workers)
- [x] FastAPI app scaffold with routers (health, agents, tasks)
- [x] Docker Compose (PostgreSQL, Redis, Memgraph, Memgraph Lab, LiteLLM, Langfuse, Traefik)
- [x] Makefile with dev commands (up, down, api, worker, fe, migrate, seed, logs, reset)
- [x] .env.example template with all required API keys and service configs
- [x] .gitignore configured
- [ ] Alembic migration setup (database schema)
- [ ] Celery worker implementation (task execution pipeline)
- [ ] GitHub Actions CI/CD pipeline (lint, test, build)

#### Week 2: Agent Framework
- [x] Base `Agent` ABC class (foundation for creations)
- [x] `TaskInput` and `TaskResult` Pydantic models
- [x] Coder agent stub (ready for tool integration)
- [x] Research agent stub (ready for tool integration)
- [ ] Pydantic schemas: full `AgentConfig` with versioning
- [ ] Agent config loader (YAML → AgentConfig)
- [ ] Tool base class + tool registry
- [ ] Memory manager (PostgreSQL + pgai interface)
- [ ] Guardrail system (output validation, cost control)
- [ ] Unit tests (>80% coverage)

#### Week 3: First Agents (Coder + Research)
- [x] Base agent implementations (stubs for Coder + Research)
- [ ] Coder agent integration
  - [ ] GitHub MCP integration (read repos, create PRs)
  - [ ] Code interpreter (Python + JavaScript execution)
  - [ ] Terminal tool (bash with safeguards)
  - [ ] Unit tests
- [ ] Research agent integration
  - [ ] Web search tool
  - [ ] PDF reader
  - [ ] pgai semantic search (RAG)
  - [ ] Unit tests
- [ ] Task executor (Celery worker)
  - [x] Celery app configured
  - [ ] Dequeue, execute, store result
  - [ ] Error handling + retries
  - [ ] Cost tracking (via Langfuse)
  - [ ] Integration tests

#### Week 4: Memory & Observability
- [x] Infra services running (PostgreSQL, Redis, Memgraph, pgai, LiteLLM, Langfuse)
- [x] Docker Compose with Traefik for local development
- [ ] PostgreSQL schema migrations
  - [ ] users, tasks, agents_config, audit_log tables
  - [ ] Indexes optimized
  - [ ] Alembic migration scripts
- [x] PgaiMemoryService stub (ready for semantic search integration)
- [x] MemgraphService stub (ready for graph queries)
- [ ] Langfuse integration
  - [ ] LLM tracing for all agent calls
  - [ ] Cost breakdown by agent
  - [ ] Dashboard visibility
- [x] API endpoints scaffolded (GET /agents, POST /tasks, GET /tasks/{id}, GET /health)
- [ ] Docker image build & push to ACR
- [x] Frontend landing page + layout
- [x] Manual testing & documentation updates

### Success Criteria
- [ ] Both agents produce measurable outputs (code, reports)
- [ ] Success rate >90% for both agents
- [ ] Latency p95 < 5 minutes per task
- [ ] Cost forecast accuracy >80% (actual vs estimated)
- [ ] Unit test coverage >80%
- [ ] Architecture doc complete
- [ ] Internal team can execute tasks via API

### Timeline
- **Start:** 2026-03-15
- **End:** 2026-04-15
- **Buffer:** 3 days for hotfixes

---

## Phase 2: Team Composition (Weeks 5–8)

### Objectives
- Expand agent roster (PM, QA, Copywriter)
- Implement orchestrator (CrewAI manager for multi-agent workflows)
- Build frontend marketplace UI
- Integrate Notion + GitHub MCPs
- Internal dogfood (team using agents daily)
- Reach 50 internal tasks/week

### Deliverables

#### Week 5: Orchestrator + Additional Agents
- [ ] CrewAI manager orchestrator
  - [ ] Sequential pipeline (Agent A → B → C)
  - [ ] Parallel execution (A, B, C concurrently)
  - [ ] Task type routing (goal → best agent)
  - [ ] Error recovery + fallback agents
- [ ] PM agent (Product Manager)
  - [ ] Notion MCP integration (read/write pages)
  - [ ] PRD generation
  - [ ] Epic breakdowns
- [ ] QA agent (Quality Assurance)
  - [ ] Playwright tool (browser automation)
  - [ ] Test plan generation
  - [ ] Bug report formatting
- [ ] Copywriter agent
  - [ ] Email generation
  - [ ] Blog post drafting
  - [ ] CTA optimization
- [ ] Integration tests (multi-agent workflows)

#### Week 6: Frontend Marketplace (Part 1)
- [ ] Next.js project setup (App Router, Tailwind)
- [ ] Authentication (NextAuth.js)
- [ ] Agent marketplace page
  - [ ] Browse all agents
  - [ ] Filter by role, cost, tier
  - [ ] Sort by success rate
  - [ ] Agent detail page (bio, tools, past outputs, reviews)
- [ ] Task creation form
  - [ ] Goal input
  - [ ] Context upload (PDF, markdown)
  - [ ] Budget slider
  - [ ] Agent selector (manual or auto)
  - [ ] Cost estimate preview

#### Week 7: Frontend Marketplace (Part 2) + Billing
- [ ] Task monitoring (real-time SSE)
  - [ ] Live progress bar
  - [ ] Agent reasoning trace
  - [ ] Tool call log
  - [ ] Time elapsed, cost accruing
- [ ] Task results page
  - [ ] Display output (markdown, code, PDF)
  - [ ] Download options
  - [ ] Agent rating form
  - [ ] Share results (link copy)
- [ ] Billing dashboard (Phase 2A, basic)
  - [ ] Current subscription tier
  - [ ] This week's usage (tasks, cost)
  - [ ] Cost breakdown by agent
  - [ ] Tier selection (read-only for MVP)

#### Week 8: Internal Dogfood + Polish
- [ ] Team starts using agents internally
  - [ ] Daily standup summaries (Research agent)
  - [ ] Code reviews automated (Coder agent)
  - [ ] QA test runs (QA agent)
  - [ ] Marketing copy drafts (Copywriter agent)
- [ ] Feedback collection & quick fixes
- [ ] Documentation updates
- [ ] Langfuse dashboard review (cost trending)
- [ ] Performance optimization (if needed)

### Success Criteria
- [ ] 3 new agents live + tested (PM, QA, Copywriter)
- [ ] Orchestrator routes tasks successfully
- [ ] Frontend marketplace functional (agents, tasks, results)
- [ ] 50+ internal tasks executed
- [ ] Agent success rate >90% across all agents
- [ ] Team confidence > "ready for external beta"
- [ ] Full stack documented (API, UI, agent behavior)

### Timeline
- **Start:** 2026-04-19
- **End:** 2026-05-17
- **Buffer:** 2 days for critical bugs

---

## Phase 3: Platform (Weeks 9–14)

### Objectives
- Public marketplace (sign up, browse agents, hire weekly)
- Billing engine (Stripe, weekly cycles, usage tracking)
- Image + Video agents
- Reach 50+ paying customers, 500 tasks/month
- Evaluate Memgraph decision (keep or remove)

### Deliverables

#### Week 9: Billing Engine
- [ ] Stripe integration
  - [ ] Payment method collection
  - [ ] Subscription management (weekly)
  - [ ] Webhook handlers (payment success/fail)
- [ ] Billing models
  - [ ] Tier pricing ($49–$1,500/week)
  - [ ] Usage overage (per-task surcharge)
  - [ ] Invoice generation
- [ ] Billing dashboard (complete)
  - [ ] Current tier + renewal date
  - [ ] Usage overview (tasks, cost, projected total)
  - [ ] Tier upgrade/downgrade
  - [ ] Invoice history + download
  - [ ] Usage alerts (80%, 100% of budget)

#### Week 10: Public UI + Signup
- [ ] Landing page
  - [ ] Value proposition
  - [ ] Agent carousel
  - [ ] Pricing table
  - [ ] CTA (Sign up free)
- [ ] Signup flow
  - [ ] Email + password
  - [ ] Welcome email
  - [ ] Onboarding checklist (first task walkthrough)
- [ ] Admin dashboard (internal only)
  - [ ] User management
  - [ ] Subscription overview
  - [ ] Revenue tracking
  - [ ] Agent performance metrics

#### Week 11: Image Designer Agent
- [ ] Stable Diffusion / DALL-E integration
  - [ ] Prompt engineering (turn goal → image prompt)
  - [ ] Image generation
  - [ ] Figma MCP integration (export to design file)
- [ ] Quality assurance (image must match goal)
- [ ] Cost control (image generation expensive)
- [ ] Unit + integration tests

#### Week 12: Video Editor Agent
- [ ] RunwayML / Kling API integration
  - [ ] Video generation from script
  - [ ] FFmpeg post-processing
  - [ ] Format conversion (MP4, WebM)
- [ ] Cost control + timeout limits
- [ ] Unit + integration tests
- [ ] Performance monitoring (videos slow to generate)

#### Week 13: Evaluation & Optimization
- [ ] Memgraph decision point
  - [ ] Query performance review
  - [ ] Operational overhead assessment
  - [ ] Decision: keep for Phase 4+ or remove?
  - [ ] If remove: archive data to PostgreSQL, shut down service
- [ ] Agent performance tuning
  - [ ] Analyze task success/failure rates
  - [ ] Prompt refinement (if success rate < 90%)
  - [ ] Tool integration fixes
- [ ] Cost optimization
  - [ ] Route expensive tasks to cheaper LLM (Haiku, Flash)
  - [ ] Cache common responses
  - [ ] Batch similar tasks

#### Week 14: Launch & Monitor
- [ ] Public launch (announce, email list, social)
- [ ] Monitor Langfuse for cost trends
- [ ] Support tickets triage (help users)
- [ ] Bug fixes (hotfix commits to main)
- [ ] Customer onboarding (1-on-1 calls if needed)

### Success Criteria
- [ ] Billing engine fully operational
- [ ] 50+ paying customers by end of week
- [ ] 500 tasks completed in this phase
- [ ] Average task success rate >90%
- [ ] LLM cost per task <$1.00 (average)
- [ ] Customer feedback collected (surveys, interviews)
- [ ] Memgraph decision documented + executed
- [ ] Image + Video agents live + tested

### Timeline
- **Start:** 2026-05-18
- **End:** 2026-07-02
- **Buffer:** 4 days for launch issues

---

## Phase 4: Scale & Sell (Weeks 15+)

### Objectives
- White-label packaging (customer-branded marketplace)
- Public API + SDK (programmatic agent hiring)
- Agent A/B testing + versioning
- Reach 500+ users, $50K+ MRR
- On-device LLM experimentation (mobile)
- Enterprise SLA tier ($5K+/month)

### Deliverables

#### Week 15: White-Label Infrastructure
- [ ] Multi-tenant support
  - [ ] Customer branding (logo, colors, domain)
  - [ ] Isolated task history (customer A can't see customer B's tasks)
  - [ ] Separate billing per tenant
- [ ] White-label packaging
  - [ ] Deployment template (customer spins up own instance)
  - [ ] Setup wizard
  - [ ] Support routing
- [ ] Documentation (white-label SOP)

#### Week 16: Public API + SDK
- [ ] REST API v1 (already exists, now documented + versioned)
  - [ ] OpenAPI spec (Swagger)
  - [ ] Rate limiting per tier
  - [ ] API key management + rotation
- [ ] Python SDK
  - [ ] `from agent_foundry import HireAgent`
  - [ ] CLI tool: `hire-agent --agent coder --weekly --budget $100`
  - [ ] Example scripts
- [ ] API docs + tutorials

#### Week 17–18: Agent Versioning & A/B Testing
- [ ] Version management
  - [ ] Agents support v1.0, v1.1, v2.0
  - [ ] Config inheritance (v2 inherits v1, overrides specific prompts)
- [ ] A/B testing framework
  - [ ] Route 50% of users to v1, 50% to v2
  - [ ] Compare success rate, cost, speed
  - [ ] Automated winner selection
- [ ] Agent marketplace (users can browse + select agent versions)

#### Week 19+: Growth & Scale
- [ ] On-device LLM (Ollama integration)
  - [ ] Fast, free tier (Llama 2 local execution)
  - [ ] Mobile app (React Native via Tamagui)
  - [ ] Performance benchmarks vs cloud LLMs
- [ ] Enterprise tier
  - [ ] Custom agents per customer
  - [ ] Dedicated workers + support
  - [ ] SLA guarantees (99.9% uptime)
  - [ ] Pricing: $5K+/month
- [ ] Paperclip orchestration (Phase 3+ evaluation)
  - [ ] IF previous phases showed need for more advanced workflows
  - [ ] Integrate Paperclip for client-facing orchestration
- [ ] Multi-cloud (AWS, GCP) exploration
  - [ ] Abstract infrastructure layer
  - [ ] Cost benchmarking
  - [ ] Customer choice

### Success Criteria
- [ ] White-label customers signed (at least 2)
- [ ] 500+ public users
- [ ] $50K+ MRR
- [ ] Public API used by 20+ external developers
- [ ] Agent versioning + A/B testing in production
- [ ] On-device LLM proof-of-concept
- [ ] Enterprise tier live

### Timeline
- **Start:** 2026-07-06
- **Duration:** Open-ended (ongoing growth phase)

---

## Milestones & Success Metrics

| Milestone | Timeline | Target Metric |
|-----------|----------|-----------------|
| Phase 1 Complete | 2026-04-15 | 2 agents live, success rate >90%, internal testing |
| Phase 2 Complete | 2026-05-17 | 5 agents, UI launch, 50 internal users |
| Phase 3 Complete | 2026-07-02 | Public launch, 50 paying customers, 500 tasks/month |
| Phase 4 Week 15 | 2026-07-20 | White-label ready, public API live |
| Phase 4 Week 20+ | 2026-08-24+ | 500+ users, $50K MRR, enterprise tier |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM API costs exceed budget | High | Critical | Monitor Langfuse daily, route to cheaper models, set hard limits |
| Agent hallucination > 5% | Medium | High | Output validation, guardrails, human review for critical tasks |
| Integration failures (MCP) | Medium | Medium | Circuit breakers, fallback flows, test coverage |
| Memgraph operational overhead | Low | Medium | Evaluate Phase 2, remove if not justified (Phase 3 decision) |
| Low customer adoption | Low | Critical | Internal dogfood, feature feedback loop, iterative UI improvements |
| Stripe integration bugs | Low | High | Thorough testing, sandbox environment first |

---

## Resource Plan

### Team Composition (Phase 1–2)
- 2 Backend engineers (agent framework, orchestrator)
- 1 Frontend engineer (marketplace UI)
- 1 DevOps engineer (deployment, monitoring)
- 1 Product manager (requirements, feedback)
- 1 AI/ML specialist (prompt optimization, agent tuning)

### Budget
- **Infrastructure:** $210–240 AUD/month (Phase 1–2)
- **LLM API:** $500–1000/month (testing phase)
- **Third-party tools:** $200/month (Langfuse, GitHub, Notion, Stripe)
- **Team:** (not tracked here)

---

## Rollback Plan

If a phase encounters critical blockers:
1. **Phase 1 blocker** → Pause; revisit agent framework assumptions
2. **Phase 2 blocker** → Revert to Phase 1 agents; simplify orchestrator
3. **Phase 3 blocker** → Launch with Phase 2 agents only; skip image/video for now
4. **Phase 4 blocker** → Continue Phase 3 (maintain status quo); deferPaperc
clip, white-label

---

## Documentation & Knowledge Transfer

- **Weekly syncs:** Team alignment + blockers
- **Phase end reports:** Lessons learned + recommendations
- **Architecture docs:** Updated end of each phase
- **Runbooks:** Created for operations (deployment, incident response, rollback)
- **Code comments:** Architecture decisions documented inline

---

## Document Metadata
- **Version:** 1.0
- **Last Updated:** 2026-03-14
- **Owner:** Product Team
- **Status:** Active (planning phase)
