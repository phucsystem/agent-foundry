# API Gateway & Task Execution

## Lambda FastAPI Gateway

The API Gateway is a Lambda function running FastAPI with Mangum adapter. It handles request routing, authentication, credit management, and AgentCore invocation.

**Infrastructure:**
- Runtime: Python 3.12
- Memory: 512MB
- Timeout: 5 minutes
- Architecture: ARM64 (Graviton)
- VPC: Same VPC as RDS (private subnet)
- Endpoint: Function URL (HTTPS)

---

## Authentication Flow (Logto JWT)

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
    participant Browser as User Browser
    participant FE as Next.js Frontend
    participant Logto as Logto Cloud
    participant Lambda as Lambda Gateway

    Browser->>FE: Visit app
    FE->>Logto: Redirect to login<br/>GET /authorize?redirect_uri=...
    Logto-->>Browser: Show login form
    Browser->>Logto: Submit credentials
    Logto-->>Browser: Redirect with auth code
    Browser->>FE: auth_code in URL
    FE->>Logto: Exchange code for token<br/>POST /token
    Logto-->>FE: {access_token: JWT, ...}

    FE->>Lambda: GET /api/users/me<br/>Authorization: Bearer {JWT}
    Lambda->>Lambda: Validate JWT signature<br/>PyJWKClient (cached)
    Lambda-->>FE: {user_id, email, credit_balance}

    FE->>Lambda: POST /api/tasks/content<br/>Authorization: Bearer {JWT}
    Lambda->>Lambda: Extract user_id from JWT
    Lambda-->>FE: 202 Accepted + task_id
```

**Key Components:**
- **PyJWKClient:** Caches Logto's JWKS (public keys) to avoid repeated network calls
- **JWT Claims:** Extract `sub` (user ID), `email` from token
- **Token Expiry:** Validate `exp` claim; frontend handles refresh

---

## Task Execution Flow (Async)

### Phase 1: Request & Auth

```mermaid
%%{init: {'theme': 'neutral'}}%%
graph TD
    Req["POST /api/tasks/content<br/>+ JWT + ContentTaskInput"]
    Auth["Validate JWT<br/>Extract user_id"]
    CheckAuth{"JWT<br/>valid?"}
    Reject401["❌ 401 Unauthorized"]

    Req --> Auth
    Auth --> CheckAuth
    CheckAuth -->|No| Reject401
    CheckAuth -->|Yes| Validate

    Validate["Validate ContentTaskInput<br/>Pydantic schema"]
    CheckValid{"Input<br/>valid?"}
    Reject422["❌ 422 Unprocessable Entity"]
    CheckValid -->|No| Reject422
    CheckValid -->|Yes| CreditCheck

    style Req fill:#4a90d9,stroke:#6ba3e0,color:#fff
    style Auth fill:#d4883e,stroke:#e0a060,color:#fff
    style CheckAuth fill:#9b6bb0,stroke:#b085c2,color:#fff
    style Reject401 fill:#c25a6e,stroke:#d47585,color:#fff
    style Validate fill:#d4883e,stroke:#e0a060,color:#fff
    style CheckValid fill:#9b6bb0,stroke:#b085c2,color:#fff
    style Reject422 fill:#c25a6e,stroke:#d47585,color:#fff
    style CreditCheck fill:#4a9e5c,stroke:#6db87e,color:#fff
```

### Phase 2: Credit Check & Deduction

```mermaid
%%{init: {'theme': 'neutral'}}%%
graph TD
    CreditCheck["Check user credit balance<br/>SELECT balance FROM users"]
    CheckBal{"balance >=<br/>50 cents?"}
    Reject403["❌ 403 Forbidden<br/>Insufficient credits"]
    Lock["Pessimistic Lock<br/>FOR UPDATE NOWAIT"]
    Deduct["Deduct credits<br/>UPDATE balance -= 5000"]
    CreateTx["Create transaction record<br/>type: deduction<br/>amount: 5000"]

    CreditCheck --> CheckBal
    CheckBal -->|No| Reject403
    CheckBal -->|Yes| Lock
    Lock --> Deduct
    Deduct --> CreateTx

    style CreditCheck fill:#4a9e5c,stroke:#6db87e,color:#fff
    style CheckBal fill:#9b6bb0,stroke:#b085c2,color:#fff
    style Reject403 fill:#c25a6e,stroke:#d47585,color:#fff
    style Lock fill:#9b6bb0,stroke:#b085c2,color:#fff
    style Deduct fill:#4a9e5c,stroke:#6db87e,color:#fff
    style CreateTx fill:#4a9e5c,stroke:#6db87e,color:#fff
```

### Phase 3: Create Task & Invoke AgentCore

```mermaid
%%{init: {'theme': 'neutral'}}%%
graph TD
    CreateTask["INSERT INTO content_tasks<br/>status='pending'<br/>input_json=<ContentTaskInput>"]
    GetTaskId["Get task_id from DB"]
    Return202["Return 202 Accepted<br/>{task_id, status, created_at}"]
    InvokeAC["Invoke AgentCore Runtime<br/>boto3.bedrock_agentcore.invoke_agent_runtime<br/>runtimeSessionId=task_id<br/>payload=ContentTaskInput JSON"]

    CreateTask --> GetTaskId
    GetTaskId --> Return202
    Return202 --> InvokeAC

    style CreateTask fill:#4a9e5c,stroke:#6db87e,color:#fff
    style GetTaskId fill:#4a9e5c,stroke:#6db87e,color:#fff
    style Return202 fill:#4a90d9,stroke:#6ba3e0,color:#fff
    style InvokeAC fill:#9b6bb0,stroke:#b085c2,color:#fff
```

---

## Complete Task Execution Sequence

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
    participant User as User/Frontend
    participant API as Lambda Gateway
    participant Auth as Logto
    participant RDS as RDS PostgreSQL
    participant AC as AgentCore Runtime
    participant MEM as AgentCore Memory
    participant BR as Bedrock Models

    rect rgb(100, 150, 220)
        Note over User,BR: Phase 1: Request & Credit Check
    end

    User->>API: POST /api/tasks/content<br/>+ JWT + ContentTaskInput
    API->>Auth: Validate JWT signature
    Auth-->>API: User: user-456

    API->>RDS: SELECT users WHERE id=?<br/>Get credit_balance_cents
    API->>RDS: Check balance >= 5000 cents
    RDS-->>API: balance=10000, OK

    rect rgb(100, 150, 220)
        Note over User,BR: Phase 2: Deduct & Create Task
    end

    API->>RDS: UPDATE users SET<br/>credit_balance_cents -= 5000<br/>(pessimistic lock)
    RDS-->>API: OK, new_balance=5000

    API->>RDS: INSERT INTO content_tasks<br/>status='pending'<br/>Return task_id
    RDS-->>API: task_id='t-789'

    rect rgb(100, 150, 220)
        Note over User,BR: Phase 3: Return 202 Accepted
    end

    API-->>User: 202 Accepted<br/>{task_id: 't-789',<br/>status: 'pending',<br/>created_at: timestamp}

    rect rgb(100, 150, 220)
        Note over User,BR: Phase 4: Async AgentCore Execution
    end

    API->>AC: invoke_agent_runtime<br/>runtimeSessionId='t-789'<br/>payload={topic, brand_config_id}
    AC->>RDS: SELECT brand_configs<br/>WHERE id=brand_config_id
    RDS-->>AC: BrandVoiceConfig

    AC->>MEM: retrieve_memories<br/>namespace='/brand/user-456/'<br/>query='brand preferences'
    MEM-->>AC: Past sessions + learnings

    AC->>BR: Researcher Agent<br/>Call DeepSeek V3.2<br/>SerperDev tool call
    BR-->>AC: Research results

    AC->>BR: Writer Agent<br/>Call Sonnet 3.5<br/>Draft blog content
    BR-->>AC: Draft blog

    AC->>BR: Editor Agent<br/>Call DeepSeek V3.2<br/>Refine + brand voice
    BR-->>AC: Edited content

    AC->>BR: Repurposer Agent<br/>Call DeepSeek V3.2<br/>Create variants
    BR-->>AC: Social + email variants

    AC->>BR: Quality Judge<br/>Call Haiku 3.5<br/>Score content
    BR-->>AC: QualityScore

    AC->>MEM: add_memory<br/>Store session summary<br/>+ quality score
    MEM-->>AC: OK

    AC->>RDS: UPDATE content_tasks<br/>status='completed'<br/>output_json=ContentOutput<br/>tokens_used, cost_cents
    RDS-->>AC: OK

    rect rgb(100, 150, 220)
        Note over User,BR: Phase 5: Frontend Polls for Result
    end

    User->>API: GET /api/tasks/t-789
    API->>RDS: SELECT * FROM content_tasks<br/>WHERE id='t-789'
    RDS-->>API: {status: 'completed',<br/>output_json: {...},<br/>cost_cents: 3700}
    API-->>User: 200 OK<br/>{status: 'completed',<br/>title, content, variants,<br/>quality_score, cost: $0.37}

    rect rgb(100, 150, 220)
        Note over User,BR: Phase 6: Handle Refunds
    end

    Note over API: If actual_cost (3700) < deducted (5000):<br/>Refund 1300 cents, create new transaction
```

---

## Credit System (Pessimistic Locking)

### Why Pessimistic Locking?
- Prevents race conditions when multiple tasks are submitted simultaneously
- Ensures accurate balance tracking
- Example: User has 100 cents, submits 2 tasks of 60 cents each — pessimistic lock ensures one task is rejected

### Implementation
```python
async with db.begin():
    # Lock for UPDATE prevents other transactions from reading this row
    user = await db.execute(
        "SELECT * FROM users WHERE id = ? FOR UPDATE NOWAIT",
        [user_id]
    )

    if user.credit_balance_cents < cost_cents:
        raise InsufficientCreditsError()

    # Deduct optimistically
    new_balance = user.credit_balance_cents - cost_cents
    await db.execute(
        "UPDATE users SET credit_balance_cents = ? WHERE id = ?",
        [new_balance, user_id]
    )

    # Create transaction record
    await db.execute(
        "INSERT INTO credit_transactions (user_id, amount_cents, type) VALUES (?, ?, ?)",
        [user_id, -cost_cents, 'deduction']
    )
```

### Refund Logic
After AgentCore execution:
1. Measure actual LLM token usage
2. Calculate actual cost (usually lower than estimate)
3. If `actual_cost < deducted_cost`: refund difference
4. Create separate transaction record for refund

---

## Polling Pattern (No SSE)

Frontend uses polling to check task status:

```javascript
// frontend/lib/hooks/useTasks.ts
export function useTaskById(taskId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
    // Poll every 2 seconds while status is 'pending'
    refetchInterval: (data) => data?.status === 'pending' ? 2000 : false,
    // Stop after 5 minutes
    gcTime: 300_000
  });
}
```

---

## Error Handling

| HTTP Status | Scenario | Response |
|------------|----------|----------|
| 200 | Task completed | `{status: 'completed', output: {...}, cost: 0.37}` |
| 202 | Task accepted (async) | `{status: 'pending', task_id: '...', created_at: '...'}` |
| 400 | Malformed request | `{error: 'Invalid input', details: {...}}` |
| 401 | Invalid/expired JWT | `{error: 'Unauthorized', message: 'Invalid token'}` |
| 403 | Insufficient credits | `{error: 'Forbidden', message: 'Insufficient credits'}` |
| 404 | Task not found | `{error: 'Not found', message: 'Task t-789 not found'}` |
| 422 | Validation error | `{error: 'Validation error', details: {...}}` |
| 500 | AgentCore execution failure | `{error: 'Internal error', task_id: '...'}` (task marked as failed) |

---

## Code Locations

- **Main app:** `backend/gateway/main.py` (FastAPI setup, lifespan, middleware)
- **Routers:** `backend/gateway/routers/` (content_tasks.py, users.py, credits.py, agents.py)
- **Auth:** `backend/gateway/auth/logto_jwt.py`, `dependencies.py`
- **Services:** `backend/gateway/services/` (agentcore_invoker.py, credit_service.py, task_service.py)
- **Models:** `backend/gateway/models/` (api_models.py, db_models.py)

---

## Document Metadata

- **Version:** 2.0
- **Last Updated:** 2026-03-16
- **Owner:** Backend Architecture Team
