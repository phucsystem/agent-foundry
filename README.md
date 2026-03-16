# Agent Foundry

Content Editor AI agent on AWS AgentCore. Enterprise-grade agent platform with credit-based billing and multi-channel content generation (blog, email, social).

## Architecture Overview

**Backend:**
- `backend/agentcore/` — Content Editor agent (CrewAI, 4 sub-agents: research, writing, editing, repurposing)
- `backend/gateway/` — Lambda API gateway (FastAPI + Mangum, Logto JWT auth, Stripe billing)
- `backend/observability/` — Langfuse + OpenTelemetry tracing

**Frontend:**
- Next.js 16+ (App Router) on AWS Amplify
- Content Editor pages, Credits UI, Brand voice management
- TanStack Query 5+, Tailwind CSS 4+

**Infrastructure (AWS):**
- **CDK stacks:** Foundation (VPC, RDS, Secrets Manager, S3) + AgentCore Runtime (managed agent execution)
- **Data:** RDS PostgreSQL (users, brand_configs, content_tasks, credit_transactions)
- **Observability:** Langfuse + OpenTelemetry
- **LLM Routing:** Bedrock-native (DeepSeek V3.2, Claude Sonnet, Claude Haiku)

No Docker, no Redis, no Memgraph, no LiteLLM — all managed by AWS.

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 22+ with pnpm
- AWS CLI + CDK CLI
- AWS account with Bedrock model access (us-east-1)
- Serper API key (web search)
- Logto Cloud tenant (auth)
- Stripe account (billing)

### Local Development

```bash
git clone https://github.com/phucsystem/agent-foundry.git
cd agent-foundry
cp .env.example .env
# Edit .env with AWS credentials, API keys, Serper, Logto, Stripe tokens

# Frontend
cd frontend && pnpm install && cd ..
make fe                    # http://localhost:3000

# Gateway (Lambda simulation)
make gateway-dev           # http://localhost:8000

# Agent (local AgentCore)
make agent-dev             # Run Content Editor agent
```

### Deploy to AWS

```bash
make cdk-bootstrap         # one-time AWS CDK setup
make cdk-deploy            # Deploy VPC, RDS, AgentCore Runtime
make agent-launch          # Deploy agent to AgentCore
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Agent Framework** | CrewAI 1.10+, LangGraph 0.3+ |
| **Backend** | Python 3.12, FastAPI + Mangum (Lambda) |
| **Frontend** | Next.js 16+ (App Router), React 19, TypeScript |
| **Database** | AWS RDS PostgreSQL (users, tasks, credits, brand configs) |
| **Auth** | Logto Cloud (OpenID Connect) + JWT |
| **LLM Routing** | Bedrock native — DeepSeek V3.2, Claude Sonnet, Claude Haiku |
| **Search** | Serper API (web search, URL reader) |
| **Billing** | Stripe (topup), credit-based system |
| **Observability** | Langfuse + OpenTelemetry |
| **IaC** | AWS CDK (TypeScript) |
| **CI/CD** | GitHub Actions |

## Project Structure

```
agent-foundry/
├── backend/
│   ├── agentcore/              # Content Editor agent
│   │   ├── agents/             # 4 CrewAI sub-agents (research, writing, editing, repurposing)
│   │   ├── crews/              # Sequential crew orchestration
│   │   ├── tools/              # SerperDev, URL reader, brand voice
│   │   ├── models/             # Pydantic I/O contracts
│   │   ├── services/           # Quality scoring, memory, task lifecycle
│   │   └── config/             # Agent + rubric YAML configs
│   ├── gateway/                # Lambda API Gateway
│   │   ├── routers/            # content_tasks, agents, users, credits
│   │   ├── services/           # AgentCore invoker, Stripe, task manager
│   │   ├── auth/               # Logto JWT + auto-provisioning
│   │   └── models/             # API + DB models
│   ├── database/               # RDS schema contracts
│   └── observability/          # Langfuse + OpenTelemetry
├── frontend/                   # Next.js 16+
│   ├── app/content/            # Content Editor pages
│   ├── app/credits/            # Credit topup UI
│   ├── components/             # UI components
│   └── lib/                    # Hooks, types, API client
├── infra/
│   ├── cdk/                    # AWS CDK stacks (TypeScript)
│   │   ├── foundation-stack.ts # VPC, RDS, Secrets
│   │   └── agentcore-stack.ts  # AgentCore Runtime
│   └── migrations/             # RDS schema
├── docs/                       # Architecture docs with Mermaid
├── Makefile                    # Development commands
├── amplify.yml                 # Amplify deployment config
└── CLAUDE.md                   # AI assistant instructions
```

## Business Model (MVP)

**Content Editor Agent:**
- Blog articles: $0.50/generation
- Email sequences: $0.30/generation
- Social media: $0.20/generation

**Credit System:**
- Free on signup: $5 credit
- Stripe topup: $10 / $25 / $50 plans
- Estimated cost: $102–260/month at beta scale (5–10 users)

## Development Commands

```bash
make fe                    # Run Next.js frontend
make gateway-dev           # Run Lambda gateway locally
make agent-dev             # Run agent locally
make lint                  # Lint Python + TypeScript
make test                  # Run test suite
make check                 # Type check + lint
make cdk-deploy            # Deploy AWS stacks
make agent-launch          # Deploy agent to AgentCore Runtime
```

## Documentation

Read in order:

1. **[Project Overview (PDR)](./docs/project-overview-pdr.md)** — Business context, requirements, user personas
2. **[System Architecture](./docs/system-architecture.md)** — AWS AgentCore design, data flow, API contracts
3. **[Code Standards](./docs/code-standards.md)** — Python/TypeScript conventions, naming, file size limits
4. **[Design Guidelines](./docs/design-guidelines.md)** — UI/UX patterns, Tailwind design system

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/content-tasks` | POST | Create content generation task |
| `/api/content-tasks/{id}` | GET | Get task status & results |
| `/api/credits` | GET | User credit balance |
| `/api/credits/topup` | POST | Stripe topup |
| `/api/agents` | GET | List available agents |
| `/api/brand-config` | GET/PUT | Brand voice settings |

See [System Architecture](./docs/system-architecture.md) for full endpoint matrix.

## Local Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Gateway | http://localhost:8000 |
| Gateway docs | http://localhost:8000/docs |

## Testing

```bash
make test                  # Run all tests
make test-agent            # Test agent logic only
make test-gateway          # Test API logic only
```

## Contributing

- Follow [code-standards.md](./docs/code-standards.md)
- Create feature branches: `feature/{feature-name}`
- Open PRs with test coverage
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Costs (AWS)

**Infrastructure (monthly):**
- RDS PostgreSQL: ~$30–50
- Lambda: ~$10–30 (usage-dependent)
- Total: ~$50–100/month

**LLM costs (Bedrock):**
- DeepSeek V3.2: $0.62/1M input
- Claude Sonnet: $3/1M input
- Claude Haiku: $0.25/1M input

Estimated $102–260/month at beta scale (5–10 users, 10–20 tasks/user/month).

## Status

- **Current:** MVP (Content Editor agent)
- **Phase 1 Complete:** Core agent framework, gateway, RDS schema, authentication
- **Phase 2 (Planned):** Image Editor agent, expanded content types, team workspace
- **Phase 3 (Planned):** Video Editor agent, white-label packaging, public API

---

**Last updated:** 2026-03-16 | AWS AgentCore | MVP Status
