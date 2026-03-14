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

---

<!-- IPA-TEMPLATE-START -->
<!-- DO NOT EDIT THIS SECTION - Managed by ipa-ck -->

AI-facing guidance for Claude Code with IPA (Japan Standard) documentation workflow.

---

## ARCHITECTURE NOTE

**v1.3.0:** Skills-based architecture. All IPA functionality is implemented as skills in `.claude/skills/`.

**Slash Commands:** All `/ipa:*`, `/ipa-docs:*`, `/lean:*` commands are user-invocable skills.

---

## CUSTOM PATHS NOTE

**If using custom paths in `.ck.json`:**

```json
{
  "paths": {
    "ck-docs": "ck-docs",    // instead of "docs/"
    "ck-plans": "ck-plans"   // instead of "plans/"
  }
}
```

Replace `docs/` → your custom docs path, `plans/` → your custom plans path in all IPA commands.

**Example:** If `ck-docs: "ck-docs"`, then `/ipa:spec` outputs to `ck-docs/SRD.md` instead of `docs/SRD.md`.

---

## IPA DOCUMENTATION WORKFLOW

**New Project (Step-by-step):**
```
/lean [idea] → MVP Analysis + GATE 1
    ↓
/ipa:spec @url/@image → docs/SRD.md + docs/UI_SPEC.md (with Design System) + GATE 2
    ↓
/ipa:design → prototypes/ (implements Design System) + GATE 3
    ↓
/ipa:detail → docs/API_SPEC.md, docs/DB_DESIGN.md
    ↓
/plan @docs/ @prototypes/ → /code → /ipa-docs:sync → Launch MVP
```

**Design Reference Flow (NEW in v1.3.0):**
```
# With reference URL/image - design research in /ipa:spec
/ipa:spec @https://stripe.com   → UI_SPEC.md with extracted Design System
/ipa:spec @./design.png         → UI_SPEC.md with extracted Design System
                ↓
/ipa:design                     → prototypes/ (pure implementation)

# Without reference - WebSearch for design inspiration
/ipa:spec [feature-desc]        → Proposes 3 design options → User selects → UI_SPEC.md
```

**New Project (Fast mode - power users):**
```
/ipa:fast [idea] → All docs in one command (skips all gates)
    ↓
/plan @docs/ @prototypes/ → /code → /ipa-docs:sync
```

**External SRS:** `/ipa:import @external-srs.md` → Generate IPA docs from external requirements

**No docs:** `/ipa:init` → Extract docs from code

**Large docs (>500 lines):** `/ipa-docs:split API_SPEC` → Modular folder structure

**First time?** Run `/ipa:start` for interactive wizard

**Quick reference?** Run `/ipa:help` for cheatsheet with warnings

---

## SLASH SKILLS

### IPA Skills

| Command | Output |
|---------|--------|
| `/ipa:fast` | **Full workflow in one command (power users)** |
| `/ipa:start` | **Interactive wizard for beginners** |
| `/ipa:help` | **Quick reference + warnings** |
| `/ipa:spec` | SRD.md + UI_SPEC.md (with Design System) + GATE 2 |
| `/ipa:design` | prototypes/ (implements Design System) + GATE 3 |
| `/ipa:detail` | API_SPEC.md + DB_DESIGN.md |
| `/ipa:import` | Import external SRS → IPA docs |
| `/ipa:init` | Extract docs from existing code |
| `/ipa:validate` | Validation report + traceability matrix |

### IPA Docs Skills

| Command | Output |
|---------|--------|
| `/ipa-docs:sync` | Sync docs with implementation |
| `/ipa-docs:split` | Split large docs into modular folders |

### Lean Skills

| Command | Output |
|---------|--------|
| `/lean` | MVP/Feature analysis + GATE 1 |
| `/lean:user-research` | docs/USER_RESEARCH.md |
| `/lean:analyze-usage` | Post-launch analytics |

---

## ⚠️ CRITICAL: PLANNING WITH CONTEXT

When running `/plan*` commands, **ALWAYS include docs and mockups**:

```bash
# ✅ CORRECT - ensures traceability + accurate UI
/plan @docs/ @prototypes/html-mockups/

# ❌ WRONG - no context, loses traceability
/plan "implement feature"
```

**Why?**
- Traceability: FR-xx → S-xx → E-xx → T-xx maintained
- Accurate UI: Code matches mockup exactly
- Design tokens: Colors, fonts, spacing applied correctly

---

## PLANNING

**Before `/plan*`:** Read `.claude/workflows/multi-model-task-distribution.md`

| Command | When to Use |
|---------|-------------|
| `/plan` | Default entry |
| `/plan:fast` | Simple, understood task |
| `/plan:hard` | Complex, needs research |

### Phase Structure

```
plans/{date}-{slug}/
├── plan.md
└── phase-NN-{name}/
    ├── core.md   # Business logic
    ├── ui.md     # User interface
    ├── data.md   # Data storage
    └── tasks.md  # Fallback
```

**Execution:** Phases run sequentially. Within phase: data → core → ui

---

## VALIDATION GATES

| Gate | After | Checklist |
|------|-------|-----------|
| 1 | `/lean` | 3+ user interviews, scope ≤ 3 phases |
| 2 | `/ipa:spec` | Stakeholder review, priorities confirmed |
| 3 | `/ipa:design` | 5+ user testing, issues addressed |

---

## PRINCIPLES

YAGNI | KISS | DRY

---

## QUALITY CHECKLIST

- [ ] Docs via /ipa:* commands
- [ ] /ipa:validate passes
- [ ] Plan refs docs/ (no duplication)
- [ ] /ipa-docs:sync after implementation

---

## REFERENCES

- Workflow: `.claude/workflows/multi-model-task-distribution.md`
- Skills: `.claude/skills/`

<!-- IPA-TEMPLATE-END -->