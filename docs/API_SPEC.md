# Interface Specification (API)

Scoped to **Agent Marketplace**, **Hired Agents (My Team)**, and **Hired Agent Detail** features.

---

## 1. Endpoint Matrix

| Method | URL | Feature | Screen | Description |
|--------|-----|---------|--------|-------------|
| GET | /api/agents | FR-01 | S-01, S-02 | List marketplace agents |
| GET | /api/agents/{agent_id} | FR-01 | S-02 | Agent public profile |
| POST | /api/agents/{agent_id}/hire | FR-02 | S-02 | Hire an agent |
| GET | /api/agents/hired | FR-03 | S-07 | List user's hired agents |
| GET | /api/agents/hired/{hire_id} | FR-04 | S-08 | Hired agent detail + stats |
| PUT | /api/agents/hired/{hire_id}/settings | FR-05 | S-07, S-08 | Update instructions + knowledge |
| DELETE | /api/agents/hired/{hire_id} | FR-06 | S-07 | Cancel hire |
| POST | /api/agents/hired/{hire_id}/rehire | FR-07 | S-07 | Re-hire cancelled agent |
| POST | /api/agents/hired/{hire_id}/knowledge | FR-05 | S-07, S-08 | Upload knowledge file |
| DELETE | /api/agents/hired/{hire_id}/knowledge/{file_id} | FR-05 | S-07, S-08 | Remove knowledge file |
| GET | /api/agents/hired/{hire_id}/tasks | FR-04 | S-08 | Recent tasks for hired agent |
| GET | /api/agents/hired/{hire_id}/stats | FR-04 | S-07, S-08 | Agent performance stats |

---

## 2. Endpoint Details

### GET /api/agents
List all marketplace agents (public catalog). Already implemented.

**Response** `200`:
```json
[
  {
    "id": "coder",
    "name": "Code Expert",
    "role": "Senior Software Engineer",
    "goal": "Write clean, tested, production-ready code",
    "version": "1.0",
    "tools": ["code_interpreter", "github_mcp", "terminal"],
    "pricing_cents_per_run": 75,
    "success_rate": 94,
    "avg_cost": 2.50,
    "avg_runtime_seconds": 45,
    "total_tasks": 1247,
    "available": true
  }
]
```

---

### GET /api/agents/{agent_id}
Agent public profile for marketplace detail page. Already implemented.

**Response** `200`:
```json
{
  "id": "coder",
  "name": "Code Expert",
  "role": "Senior Software Engineer",
  "goal": "Write clean, tested, production-ready code",
  "backstory": "...",
  "version": "1.0",
  "tools": ["code_interpreter", "github_mcp", "terminal"],
  "llm_model": "claude-sonnet",
  "pricing_cents_per_run": 75,
  "guardrails": {
    "max_budget_usd": 15.0,
    "max_runtime_seconds": 300
  },
  "success_rate": 94,
  "avg_cost": 2.50,
  "total_tasks": 1247,
  "reviews": [],
  "sample_outputs": []
}
```

**Error** `404`: `{"detail": "Agent not found"}`

---

### POST /api/agents/{agent_id}/hire
Hire an agent. Creates a `hired_agents` record linking user to agent.

**Request**:
```json
{
  "plan": "solo",
  "weekly_budget_usd": 100.00
}
```

**Response** `201`:
```json
{
  "hire_id": "uuid",
  "agent_id": "coder",
  "status": "active",
  "plan": "solo",
  "weekly_budget_usd": 100.00,
  "hired_at": "2026-03-01T00:00:00Z",
  "renews_at": "2026-03-08T00:00:00Z"
}
```

**Error** `409`: `{"detail": "Agent already hired"}`

---

### GET /api/agents/hired
List all hired agents for the authenticated user. Powers S-07 list rows.

**Response** `200`:
```json
[
  {
    "hire_id": "uuid",
    "agent_id": "coder",
    "agent_name": "Code Expert",
    "agent_role": "Senior Software Engineer",
    "agent_color": "#3B82F6",
    "status": "active",
    "plan": "solo",
    "weekly_budget_usd": 100.00,
    "hired_at": "2026-03-01T00:00:00Z",
    "renews_at": "2026-03-15T00:00:00Z",
    "stats": {
      "total_tasks": 12,
      "success_rate": 95.0,
      "avg_cost_usd": 2.40
    },
    "has_custom_instructions": true,
    "knowledge_file_count": 2
  }
]
```

---

### GET /api/agents/hired/{hire_id}
Full hired agent detail. Powers S-08 page.

**Response** `200`:
```json
{
  "hire_id": "uuid",
  "agent_id": "coder",
  "agent_name": "Code Expert",
  "agent_role": "Senior Software Engineer",
  "agent_color": "#3B82F6",
  "agent_tools": ["code_interpreter", "github_mcp", "terminal"],
  "agent_llm": "claude-sonnet",
  "status": "active",
  "plan": "solo",
  "weekly_budget_usd": 100.00,
  "hired_at": "2026-03-01T00:00:00Z",
  "renews_at": "2026-03-15T00:00:00Z",
  "settings": {
    "custom_instructions": "Follow our internal code standards...",
    "knowledge_files": [
      { "id": "uuid", "name": "code-standards.md", "size_bytes": 4300, "uploaded_at": "2026-03-02T10:00:00Z" },
      { "id": "uuid", "name": "api-conventions.md", "size_bytes": 2150, "uploaded_at": "2026-03-02T10:00:00Z" }
    ]
  },
  "stats": {
    "total_tasks": 47,
    "success_rate": 95.0,
    "failed_count": 2,
    "running_count": 1,
    "queued_count": 0,
    "avg_cost_usd": 2.40,
    "avg_runtime_seconds": 42,
    "total_spent_usd": 28.80,
    "daily_tasks": [1, 2, 3, 1, 2, 4, 0]
  },
  "cost": {
    "spent_usd": 28.80,
    "budget_usd": 100.00,
    "breakdown": [
      { "label": "LLM Tokens", "amount": 17.86 },
      { "label": "Tool Calls", "amount": 7.20 },
      { "label": "Overhead", "amount": 3.74 }
    ],
    "last_week_spent_usd": 22.40
  }
}
```

**Error** `404`: `{"detail": "Hired agent not found"}`

---

### PUT /api/agents/hired/{hire_id}/settings
Update custom instructions for the hired agent.

**Request**:
```json
{
  "custom_instructions": "Follow our internal code standards. Use Python type hints..."
}
```

**Response** `200`:
```json
{
  "hire_id": "uuid",
  "custom_instructions": "Follow our internal code standards...",
  "updated_at": "2026-03-14T10:00:00Z"
}
```

---

### POST /api/agents/hired/{hire_id}/knowledge
Upload a knowledge file (markdown). Multipart form upload.

**Request**: `multipart/form-data`
- `file`: `.md` file, max 5 MB

**Response** `201`:
```json
{
  "id": "uuid",
  "name": "code-standards.md",
  "size_bytes": 4300,
  "uploaded_at": "2026-03-14T10:00:00Z"
}
```

**Error** `413`: `{"detail": "File exceeds 5 MB limit"}`
**Error** `415`: `{"detail": "Only .md files accepted"}`

---

### DELETE /api/agents/hired/{hire_id}/knowledge/{file_id}
Remove a knowledge file.

**Response** `204`: No content

---

### DELETE /api/agents/hired/{hire_id}
Cancel a hire. Sets status to `cancelled`, agent access continues until `renews_at`.

**Response** `200`:
```json
{
  "hire_id": "uuid",
  "status": "cancelled",
  "expires_at": "2026-03-16T00:00:00Z"
}
```

---

### POST /api/agents/hired/{hire_id}/rehire
Re-hire a cancelled agent. Resets status to `active`.

**Response** `200`:
```json
{
  "hire_id": "uuid",
  "status": "active",
  "renews_at": "2026-03-21T00:00:00Z"
}
```

**Error** `409`: `{"detail": "Agent is already active"}`

---

### GET /api/agents/hired/{hire_id}/tasks
Recent tasks for this hired agent. Paginated, most recent first.

**Query params**: `?limit=5&offset=0`

**Response** `200`:
```json
{
  "tasks": [
    {
      "id": "uuid",
      "goal": "Fix authentication token refresh bug",
      "status": "completed",
      "cost_usd": 2.10,
      "runtime_seconds": 38,
      "created_at": "2026-03-14T14:30:00Z"
    }
  ],
  "total": 47
}
```

---

### GET /api/agents/hired/{hire_id}/stats
Aggregated performance stats. Used by both S-07 (summary) and S-08 (full detail).

**Query params**: `?period=week` (default: `week`, options: `week`, `month`, `all`)

**Response** `200`:
```json
{
  "total_tasks": 47,
  "completed": 44,
  "failed": 2,
  "running": 1,
  "queued": 0,
  "success_rate": 95.0,
  "avg_cost_usd": 2.40,
  "avg_runtime_seconds": 42,
  "total_spent_usd": 28.80,
  "daily_tasks": [1, 2, 3, 1, 2, 4, 0],
  "cost_breakdown": [
    { "label": "LLM Tokens", "amount": 17.86 },
    { "label": "Tool Calls", "amount": 7.20 },
    { "label": "Overhead", "amount": 3.74 }
  ]
}
```

---

## 3. Authentication

All `/api/agents/hired/*` endpoints require authentication (JWT via Logto).
`user_id` extracted from token claims. Each hire is scoped to the authenticated user.

## 4. Traceability

| Endpoint | Feature | Screens |
|----------|---------|---------|
| GET /api/agents | FR-01 Agent Catalog | S-01, S-02 |
| GET /api/agents/{id} | FR-01 Agent Detail | S-02 |
| POST /api/agents/{id}/hire | FR-02 Hire Agent | S-02 |
| GET /api/agents/hired | FR-03 My Team | S-07 |
| GET /api/agents/hired/{id} | FR-04 Agent Detail | S-08 |
| PUT /api/agents/hired/{id}/settings | FR-05 Agent Settings | S-07, S-08 |
| POST /api/agents/hired/{id}/knowledge | FR-05 Knowledge Upload | S-07, S-08 |
| DELETE /api/agents/hired/{id} | FR-06 Cancel Hire | S-07 |
| POST /api/agents/hired/{id}/rehire | FR-07 Re-hire | S-07 |
| GET /api/agents/hired/{id}/tasks | FR-04 Recent Tasks | S-08 |
| GET /api/agents/hired/{id}/stats | FR-04 Performance | S-07, S-08 |
