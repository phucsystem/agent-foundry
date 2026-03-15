# Code Standards & Conventions

## Overview

This document defines code style, patterns, and conventions for the agent-foundry project. Consistency enables faster code review, easier maintenance, and better collaboration.

---

## Python Backend Standards

### File Organization
- **Module naming:** kebab-case (`agent_loader.py`, `task_executor.py`)
- **File size:** < 200 lines per file (split large modules)
- **Imports:** Group by stdlib, third-party, local (with blank lines between)
- **Structure:** Docstring → imports → class/function definitions → main

### Type Hints
- **Mandatory:** All function signatures must include type hints
- Use `from typing import` (Python 3.12+) or `from collections.abc import` for generic types
- Return types for all functions (no implicit `None`)
- Use `Pydantic BaseModel` for data validation, not bare dicts

```python
# Good
from typing import Optional
from pydantic import BaseModel

class TaskInput(BaseModel):
    goal: str
    context: Optional[str] = None
    timeout_seconds: int = 300

def execute_task(task: TaskInput) -> TaskResult:
    """Execute a single task and return result."""
    pass

# Bad
def execute_task(task):
    return result
```

### Naming Conventions
| Category | Convention | Example |
|----------|-----------|---------|
| Variables | snake_case | `agent_name`, `task_result` |
| Functions | snake_case | `execute_task()`, `load_agent_config()` |
| Classes | PascalCase | `TaskInput`, `AgentConfig`, `MemoryManager` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT_SECONDS` |
| Private | Leading underscore | `_internal_method()`, `_cache_dict` |
| Booleans | Leading `is_` or `has_` | `is_ready`, `has_failed` |

### Comments & Docstrings
- **Module docstring:** 1-line summary at file top
- **Function docstring:** Triple-quoted, follows Google style
- **Inline comments:** Only for non-obvious logic; prefer self-documenting names
- **No commented code:** Delete dead code, use git history if needed

```python
def load_agent_config(path: str) -> AgentConfig:
    """Load YAML agent configuration from file.

    Args:
        path: File path to YAML config (e.g., 'agents/coder.yaml')

    Returns:
        Parsed AgentConfig object.

    Raises:
        FileNotFoundError: If config file not found.
        yaml.YAMLError: If YAML syntax invalid.
    """
    pass
```

### Error Handling
- Use typed exceptions (create custom exceptions for domain errors)
- Never bare `except:` — be specific
- Log errors with context (agent id, task id, user id)
- Return error status in responses, don't raise exceptions across API boundaries

```python
class AgentExecutionError(Exception):
    """Raised when agent fails to execute task."""
    pass

class GuardrailViolation(Exception):
    """Raised when output violates guardrail constraints."""
    pass

try:
    result = agent.execute(task)
except AgentExecutionError as e:
    logger.error(f"Agent {agent.id} failed on task {task.id}: {e}")
    return TaskResult(status="failed", error=str(e))
```

### Testing
- **Framework:** pytest
- **File location:** `tests/test_{module_name}.py`
- **Coverage:** Aim for >80% (exclude obvious boilerplate)
- **Fixtures:** Use pytest fixtures for reusable setup
- **Naming:** `test_{function}_with_{condition}()` (descriptive)

```python
@pytest.fixture
def sample_task():
    return TaskInput(goal="Write a function", context="Python 3.11+")

def test_execute_task_with_valid_input(sample_task):
    result = execute_task(sample_task)
    assert result.status == "completed"
    assert len(result.output) > 0
```

### Imports & Dependencies
- No circular imports (refactor if needed)
- Use absolute imports (`from src.agents import CoderAgent`)
- Pin versions in `requirements.txt` for reproducibility
- Separate dev dependencies (`requirements-dev.txt`)

### Logging
- Use `logging` module, not print statements
- Create loggers per module: `logger = logging.getLogger(__name__)`
- Log levels: DEBUG (dev), INFO (user actions), WARNING (recoverable issues), ERROR (failures)
- Include context: agent_id, task_id, user_id, duration

```python
logger.info(f"Task {task.id} started for user {user_id}",
            extra={"task_id": task.id, "agent_id": agent.id})
logger.error(f"Guardrail violation in agent output",
             extra={"agent_id": agent.id, "issue": violation.reason})
```

### Async/Await
- Use `async def` for I/O-bound operations (API calls, DB queries)
- Use `asyncio.gather()` for parallel tasks
- Never block event loop with `time.sleep()` — use `asyncio.sleep()`

```python
async def execute_agents_in_parallel(agents: list[Agent], task: TaskInput) -> list[TaskResult]:
    tasks = [agent.execute_async(task) for agent in agents]
    results = await asyncio.gather(*tasks)
    return results
```

### Configuration Management
- Use Pydantic `Settings` for environment variables
- Never commit `.env` files
- Provide `.env.example` template
- Read secrets from Azure Key Vault in production

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    database_url: str
    redis_url: str = "redis://localhost:6379"
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Frontend Standards (Next.js + TypeScript)

### File Organization
- **Components:** `components/{domain}/{Component}.tsx` (one component per file)
- **Pages:** `app/{route}/page.tsx` (App Router)
- **Hooks:** `lib/hooks/{useHookName}.ts`
- **Utils:** `lib/{utilityName}.ts`
- **Tests:** `tests/{path}/{module}.test.tsx` (mirror source structure)
- **Styles:** Tailwind classes inline + global in `app/globals.css`
- **Test Setup:** `tests/setup.ts` (Vitest global config), `tests/test-utils.tsx` (RTL + MSW helpers), `tests/mocks/` (MSW handlers)

### TypeScript
- **Strict mode:** Always enabled
- **No `any` types:** Use `unknown` with type guards or `never`
- **Interfaces:** For prop contracts, use `interface` not `type`

```typescript
interface TaskCardProps {
  taskId: string;
  agentName: string;
  status: "pending" | "running" | "completed" | "failed";
  cost: number;
}

export function TaskCard({ taskId, agentName, status, cost }: TaskCardProps) {
  // Component code
}
```

### Component Naming
- **File name:** PascalCase matching component name
- **Props suffix:** No suffix (just `Props`)
- **Exports:** Named export + default export for easier tree-shaking

```typescript
// components/TaskCard.tsx
export interface TaskCardProps { ... }
export function TaskCard(props: TaskCardProps) { ... }
export default TaskCard;
```

### Styling
- **Framework:** Tailwind CSS
- **Class organization:** Responsive → layout → spacing → typography → effects
- **Avoid:** Inline styles (use Tailwind + CSS modules for complex styling)
- **Dark mode:** Use `dark:` prefix, toggle via context

```typescript
<div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
  <span className="text-sm font-semibold text-slate-900 dark:text-white">
    Status
  </span>
</div>
```

### State Management
- **Server state (data):** TanStack Query (React Query)
- **Client state (UI):** React hooks (useState, useReducer)
- **Global state:** Context + hooks (no Redux unless justified)
- **Form state:** React Hook Form + Zod validation

```typescript
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const { data: agents, isLoading } = useQuery({
  queryKey: ["agents"],
  queryFn: () => fetch("/api/agents").then(r => r.json())
});
```

### API Integration
- **Fetch vs Axios:** Use native `fetch` or lightweight wrapper
- **Error handling:** Try/catch with typed responses
- **Typing:** Extract API response types (match backend Pydantic schemas)

```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  weeklyPrice: number;
}

async function fetchAgents(): Promise<Agent[]> {
  const response = await fetch("/api/agents");
  if (!response.ok) throw new Error("Failed to fetch agents");
  return response.json();
}
```

### Testing

**Framework:** Vitest 4.1+ + React Testing Library 16.3+

**File Location:** `tests/{path}/{module}.test.tsx` (mirrors source structure)

**Configuration:**
- `tests/setup.ts` — Vitest global configuration (MSW, DOM setup)
- `tests/test-utils.tsx` — Custom render function with providers (QueryClient, Zustand stores)
- `tests/mocks/` — MSW handlers + server instance for API mocking
- `vitest.config.ts` — Vitest + Vite setup (jsdom environment, path aliases)

**Coverage:** >80% for components, hooks, utilities

**Test Style:** Test behavior, not implementation

**Naming Convention:** `test_{function}_with_{scenario}()` (descriptive)

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";

describe("TaskCard", () => {
  it("displays task status correctly", () => {
    renderWithProviders(
      <TaskCard taskId="1" agentName="Coder" status="completed" cost={5} />
    );
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("calls onStatusChange when retry button clicked", async () => {
    const onStatusChange = vi.fn();
    renderWithProviders(
      <TaskCard taskId="1" status="failed" onStatusChange={onStatusChange} />
    );

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(retryButton);

    expect(onStatusChange).toHaveBeenCalledWith("pending");
  });
});
```

**MSW Setup Example:**
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/agents", () => HttpResponse.json([...mockAgents])),
  http.post("/api/tasks", () => HttpResponse.json({ id: "task-123" }, { status: 201 }))
];
```

**Running Tests:**
```bash
npm run test           # Run all tests once
npm run test:watch    # Watch mode
npm run test -- --ui  # UI mode (browser)
```

### Accessibility
- **Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, not divs
- **ARIA attributes:** Only when semantic HTML insufficient
- **Contrast:** WCAG AA minimum (Tailwind defaults meet this)
- **Keyboard navigation:** All interactive elements reachable via Tab
- **Focus management:** Visible focus indicators (outline-2)

---

## Git & Commit Conventions

### Branch Naming
- Feature: `feature/agent-name-description` (e.g., `feature/coder-github-integration`)
- Bug fix: `fix/issue-description` (e.g., `fix/task-timeout-handling`)
- Chore: `chore/task-description` (e.g., `chore/update-dependencies`)

### Commit Messages
- **Format:** Conventional Commits
- **Structure:** `type: description` (lowercase, no period)
- **Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **No AI references** in messages

```
feat: add coder agent with GitHub integration
fix: prevent task timeout race condition
docs: update agent anatomy in code-standards
test: add guardrail validation tests
```

### Code Review
- All PRs reviewed before merge
- Minimum 1 approval (2 for critical paths)
- Address all feedback before merging
- Squash-merge for clean history

---

## API Design Standards

### REST Endpoints
- **Resource-based:** `/agents`, `/tasks`, `/subscriptions` (plural nouns)
- **Versioning:** Optional for MVP (`/v1/agents`), add if breaking changes
- **Status codes:** 200 (success), 201 (created), 400 (bad request), 401 (auth), 404 (not found), 500 (server error)

### Request/Response Format
- **Content-Type:** `application/json` only
- **Naming:** camelCase for JSON keys
- **Pagination:** Use query params (`?page=1&limit=20`)
- **Filtering:** Query params (`?status=completed&agent_id=coder`)
- **Sorting:** `?sort_by=cost&order=asc`

```json
// Request
POST /api/tasks
{
  "agentId": "coder",
  "goal": "Fix login bug",
  "context": "See PR #123",
  "budgetUsd": 10.0
}

// Response (201)
{
  "id": "task-abc123",
  "agentId": "coder",
  "status": "pending",
  "createdAt": "2026-03-14T10:00:00Z",
  "estimatedCostUsd": 2.50
}
```

### Error Responses
- Consistent format with error code + message
- Include field-level validation errors

```json
{
  "error": "INVALID_REQUEST",
  "message": "Bad request: missing required field 'goal'",
  "details": {
    "goal": "This field is required"
  }
}
```

---

## Database Standards

### PostgreSQL
- **Schema:** Use migrations (Alembic or similar)
- **Naming:** snake_case tables, snake_case columns
- **Indexes:** On foreign keys, frequently filtered columns
- **Constraints:** NOT NULL, UNIQUE, FOREIGN KEY where appropriate
- **Audit columns:** `created_at`, `updated_at` on all tables

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  weekly_price_cents INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Memgraph (Relational Graph)
- **Node naming:** PascalCase (`Agent`, `Task`, `Project`)
- **Property naming:** camelCase
- **Relationships:** UPPERCASE (`:EXECUTES`, `:BELONGS_TO`)
- **Queries:** Use Cypher syntax

```cypher
MATCH (agent:Agent)-[:EXECUTES]->(task:Task)-[:BELONGS_TO]->(project:Project)
WHERE agent.success_rate > 0.9
RETURN agent, task, project
```

---

## Documentation Standards

### Code Comments
- Explain **why**, not **what** (code explains what)
- Use comments for complex algorithms, non-obvious decisions
- Keep comments in sync with code (no stale comments)

### README Files
- Project overview, quick start, tech stack
- Contribution guidelines
- License

### Architecture Diagrams
- Use Mermaid or ASCII diagrams
- Show data flow, agent interactions, deployment topology
- Update when major changes occur

### API Documentation
- FastAPI auto-docs (Swagger/ReDoc) from type hints + docstrings
- Markdown guides for multi-step workflows
- Example requests/responses

---

## Performance Guidelines

### Python Backend
- Database queries: Use indexes, avoid N+1 (check with explain)
- Caching: Redis for frequently accessed data (agents, configs, user preferences)
- Async: Use `async/await` for I/O, never block event loop
- Timeouts: Set reasonable limits on external calls (5-30s)

### Frontend
- Bundle size: < 200KB (gzipped)
- Time to interactive (TTI): < 3 seconds
- Image optimization: Use `next/image`, lazy load off-screen images
- Code splitting: Automatic via Next.js App Router

### Monitoring
- Slow queries: Log any query > 1 second
- Error rate: Alert if > 1% of requests fail
- LLM latency: Track p50, p95, p99 per agent type

---

## Security Checklist

- [ ] No hardcoded secrets (use environment variables / Key Vault)
- [ ] Input validation (Pydantic for API, form validation frontend)
- [ ] HTTPS enforced (TLS 1.2+)
- [ ] SQL injection prevention (use parameterised queries)
- [ ] CORS configured correctly (whitelist origins)
- [ ] Auth tokens: short-lived + refresh token rotation
- [ ] Rate limiting on public endpoints
- [ ] Audit logging for sensitive operations
- [ ] Dependencies: regularly scan for vulnerabilities (`pip-audit`, Snyk)

---

## Development Scripts

### Frontend Commands
```bash
npm run dev           # Start Next.js dev server
npm run build         # Build for production
npm run lint          # Type check with tsc
npm run test          # Run unit tests (Vitest)
npm run test:watch   # Unit tests watch mode
npm start             # Start production server
```

### Backend Commands (Python)
```bash
make up              # Start Docker infra
make api             # Run FastAPI dev server
make worker          # Run Celery worker
make test            # Run pytest
make migrate         # Run Alembic migrations
```

---

## Document Metadata
- **Version:** 1.1
- **Last Updated:** 2026-03-15
- **Owner:** Engineering Team
- **Status:** Active
- **Testing Infrastructure:** Complete (Vitest, RTL, MSW - 20 test files, 122 tests)
