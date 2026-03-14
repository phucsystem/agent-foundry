# Agent Foundry

Build and hire specialised AI agents. A platform for composing autonomous agents into workflows and renting them weekly like a staffing agency for AI workers.

## Vision

Deploy a suite of domain-expert AI agents (Image Designer, Video Editor, Coder, PM, Research, Copywriter, QA) as reusable components within your own workflows, and monetise them via weekly subscription tiers targeting SMBs and enterprises.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker, Docker Compose
- Azure CLI (production)
- Git

### Local Development Setup

```bash
# Clone and configure
git clone https://github.com/yourusername/agent-foundry.git
cd agent-foundry
cp .env.example .env
# Edit .env with your API keys (ANTHROPIC_API_KEY, OPENROUTER_API_KEY, etc.)

# Start infrastructure (Postgres, Redis, Memgraph, LiteLLM, Langfuse)
make up

# Backend (new terminal)
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
cd ..
make api

# Frontend (new terminal)
cd frontend
npm install
cd ..
make fe
```

## Tech Stack

**Backend:**
- Python 3.11+, CrewAI + LangGraph
- FastAPI + Uvicorn
- Celery + Redis (async jobs)
- PostgreSQL + pgai (semantic memory, RAG)
- Memgraph (relational graph — Phase 1 MVP)

**Memory:**
- PostgreSQL — billing, auth, configs
- pgai (Timescale) — semantic search, embeddings, RAG
- Memgraph — agent/task/project relationships, reputation

**Frontend:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Tamagui
- TanStack Query, Router, Form, Virtual
- FastAPI SSE integration

**LLM Backends:**
- Primary: Claude Sonnet 4.6
- Routing: LiteLLM + OpenRouter (200+ models, one API key)
- On-device: Ollama (experimental)

**Observability:**
- Langfuse (self-hosted) — LLM tracing
- OpenTelemetry → Azure Monitor

**Deployment:**
- Docker Compose (local)
- Azure Container Apps (production)
- Azure Database for PostgreSQL
- Azure Cache for Redis
- CI/CD: GitHub Actions → ACR

## Project Structure (Planned)

```
agent-foundry/
├── README.md                           # This file
├── docs/                               # Documentation
│   ├── project-overview-pdr.md         # Product requirements
│   ├── code-standards.md               # Code conventions
│   ├── system-architecture.md          # System design
│   ├── codebase-summary.md             # Planned structure
│   ├── project-roadmap.md              # Phases & timeline
│   ├── deployment-guide.md             # Azure deployment
│   └── design-guidelines.md            # UI/UX standards
├── backend/                            # Python backend
│   ├── src/
│   │   ├── agents/                     # Agent definitions & implementations
│   │   ├── orchestrator/               # Workflow management (CrewAI/LangGraph)
│   │   ├── api/                        # FastAPI routes
│   │   ├── memory/                     # Memory interfaces (pgai, Memgraph)
│   │   ├── guardrails/                 # Output validation, cost limits
│   │   ├── integrations/               # MCP adapters, tool implementations
│   │   └── models/                     # Pydantic schemas
│   ├── agents_config/                  # YAML agent definitions
│   ├── tests/                          # Unit & integration tests
│   ├── requirements.txt
│   └── docker/Dockerfile
├── frontend/                           # Next.js frontend
│   ├── app/                            # App Router pages
│   ├── components/                     # React components
│   ├── lib/                            # Utilities, API clients
│   ├── styles/                         # Global styles
│   ├── package.json
│   └── docker/Dockerfile
├── docker-compose.yml                  # Local development stack
├── azure/                              # IaC
│   ├── main.bicep                      # Azure infrastructure
│   └── parameters.json
└── .github/workflows/                  # CI/CD pipelines
```

## Core Concepts

### Separation: Flow vs Crew
- **Flow** = Deterministic backbone (business rules, routing, validation) — YOU control
- **Crew/Agents** = Intelligence layer (LLM reasoning within boundaries) — agents decide HOW
- Clear contract: Agents receive `TaskInput`, return `TaskResult`

### Agent Anatomy
| Layer | Responsibility |
|-------|-----------------|
| Identity | Role, goal, backstory, specialisation prompt |
| Brain | LLM (Claude Sonnet, GPT-4o, Gemini, Ollama) |
| Tools | APIs, file I/O, web search, design tools, code executors |
| Memory | Session + pgai semantic + Memgraph relationships |
| Guardrails | Output validation, hallucination checks, cost limits |
| I/O | Pydantic TaskInput → TaskResult |

### Agent Roster (MVP)
- 💻 **Coder** — Code interpreter, GitHub MCP, terminal → PRs/diffs
- 🔍 **Research** — Web search, PDF reader → Markdown reports
- 📋 **PM** — Notion MCP, Jira/Linear MCP → PRDs/tickets
- 🧪 **QA** — Playwright/Cypress → test reports/bugs
- 📣 **Copywriter** — CMS APIs, email tools → content
- 🎨 **Image Design** *(Phase 2)* — Stable Diffusion/DALL-E/Midjourney → PNG/SVG
- 🎬 **Video Design** *(Phase 3)* — RunwayML/Kling/Sora, FFmpeg → MP4

### Business Model: Weekly Hiring
| Tier | Agents | Price |
|------|--------|-------|
| Solo | 1 agent | $49–$199/week |
| Small Team | 3 agents (PM+Coder+QA) | $299–$499/week |
| Full Squad | 5+ agents, orchestrated | $799–$1,499/week |
| Enterprise | Custom, SLA, dedicated | Custom |

Revenue: Weekly subscriptions, usage-based add-ons, outcome-based pricing, white-label, marketplace.

## Documentation — Engineer Onboarding Guide

All project documentation lives in [`/docs`](./docs/). Read in the order below to onboard effectively.

### Start Here

| # | Document | What You'll Learn |
|---|----------|-------------------|
| 1 | **[Project Overview (PDR)](./docs/project-overview-pdr.md)** | Business context, functional & non-functional requirements, target users |
| 2 | **[System Architecture](./docs/system-architecture.md)** | System design, data flow, API contracts, service boundaries |
| 3 | **[Codebase Summary](./docs/codebase-summary.md)** | Module inventory, line counts, completion status across all phases |

### Architecture & Design

| Document | What You'll Learn |
|----------|-------------------|
| **[SRD — Super Admin](./docs/SRD.md)** | System requirement definition for admin panel (metrics, user mgmt, health) |
| **[API Specification](./docs/API_SPEC.md)** | Endpoint matrix for agent marketplace, hiring, and team management |
| **[DB Design](./docs/DB_DESIGN.md)** | ER diagrams, schema extensions for agent hiring, settings, knowledge files |
| **[UI Specification](./docs/UI_SPEC.md)** | Design system (Vercel-inspired dark mode), component specs, admin layouts |

### Standards & Guidelines

| Document | What You'll Learn |
|----------|-------------------|
| **[Code Standards](./docs/code-standards.md)** | Python/TypeScript conventions, naming, error handling, file size limits |
| **[Design Guidelines](./docs/design-guidelines.md)** | UI/UX patterns, component library, responsive breakpoints |

### Operations

| Document | What You'll Learn |
|----------|-------------------|
| **[Deployment Guide](./docs/deployment-guide.md)** | Docker Compose (10 containers), Azure Bicep IaC, CI/CD, env vars, scaling |
| **[Project Roadmap](./docs/project-roadmap.md)** | 4 phases, timeline, milestones, current progress |

### Progress Reports

| Document | What You'll Learn |
|----------|-------------------|
| **[Phase 1 Completion Summary](./docs/PHASE-1-COMPLETION-SUMMARY.md)** | Full Phase 1 delivery — 92K backend lines, 41K frontend lines, 9 modules |
| **[Phase 1 Week 1 Summary](./docs/PHASE-1-WEEK-1-COMPLETION-SUMMARY.md)** | Week 1 foundation deliverables and verification results |

## Development

### Running Tests (Phase 1+)
```bash
pytest tests/ -v --cov=src
```

### Building Docker Images
```bash
docker-compose build
docker-compose up
```

### Deployment to Azure (Phase 1+)
See [deployment-guide.md](./docs/deployment-guide.md) for full instructions.

```bash
az login
az group create --name agent-foundry-rg --location australiaeast
# ... (Bicep deployment)
```

## Contributing

- Follow [code-standards.md](./docs/code-standards.md) for conventions
- Create feature branches: `feature/agent-name-functionality`
- Open PRs with test coverage
- See [CONTRIBUTING.md](#) (TODO) for full guidelines

## Roadmap

**Phase 1 (Weeks 1–4):** Foundation
- Agent interface contract
- Coder + Research agents
- PostgreSQL + pgai + Memgraph
- Langfuse integration

**Phase 2 (Weeks 5–8):** Team Composition
- PM + QA + Copywriter agents
- Orchestrator (CrewAI manager + LangGraph)
- Notion + GitHub MCP

**Phase 3 (Weeks 9–14):** Platform
- Hiring UI (Next.js marketplace)
- Billing (weekly Stripe cycles)
- Image + Video agents

**Phase 4 (Weeks 15+):** Scale & Sell
- White-label packaging
- Public API
- On-device LLM for mobile

See [project-roadmap.md](./docs/project-roadmap.md) for detailed milestones.

## Costs

**Estimated Azure Production Cost:** $210–240 AUD/month (excl. LLM API costs)
- Container Apps (auto-scale to zero)
- PostgreSQL Flexible (B2ms burstable)
- Redis Cache
- Static Web Apps for frontend

LLM costs depend on usage tier & model choice (Claude Sonnet ~$3–15K/month at scale).

## Observability

- **Langfuse** (self-hosted) — LLM tracing, cost tracking, quality monitoring
- **OpenTelemetry** — Application metrics → Azure Monitor
- **PostgreSQL logs** — Audit trail for billing, auth, API calls

## Support & Contact

- **Issues:** GitHub Issues
- **Docs:** See `/docs` directory
- **Slack:** (TBD)
- **Email:** team@yourdomain.com (TBD)

## License

TBD

---

**Last updated:** 2026-03-14
**Phase:** Foundation (Phase 1)
**Status:** Planning
