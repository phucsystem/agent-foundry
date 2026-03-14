# Basic Design (UI Specification) — Agent Foundry Platform

## 1. Design System

### Reference Source
- Style: Established in `docs/design-guidelines.md`
- Framework: Tailwind CSS v4 + @theme tokens
- Mode: Dark mode default with toggle
- Implemented: 2026-03-14 (Phases 1–2, 11)

### Color Palette

Inherits from `docs/design-guidelines.md`:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-primary | #3B82F6 | #3B82F6 | CTAs, links, active states, agent cards |
| --color-success | #10B981 | #10B981 | Completed tasks, agent ready, positive deltas |
| --color-warning | #F59E0B | #F59E0B | Budget warnings, long runtime, renewing_soon |
| --color-error | #EF4444 | #EF4444 | Failed tasks, agent unavailable, cancel actions |
| --color-neutral | #64748B | #64748B | Secondary text, dividers |
| --color-bg | #FFFFFF | #0F172A | Page background |
| --color-surface | #F8FAFC | #1E293B | Card background |
| --color-border | #E2E8F0 | #334155 | Borders, dividers |
| --color-text | #0F172A | #F8FAFC | Primary text |
| --color-text-muted | #64748B | #94A3B8 | Secondary text, labels |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| --font-sans | -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif | All text |
| --text-h1 | 32px / 700 | Page titles |
| --text-h2 | 24px / 600 | Section headings |
| --text-h3 | 20px / 600 | Subsection headings |
| --text-body | 16px / 400 | Main text |
| --text-sm | 14px / 400 | Labels, secondary text |
| --text-xs | 12px / 400 | Captions, timestamps |

### Spacing Scale

| Token | Value | Tailwind |
|-------|-------|----------|
| xs | 4px | gap-1 |
| sm | 8px | gap-2 |
| md | 16px | gap-4 |
| lg | 24px | gap-6 |
| xl | 32px | gap-8 |
| 2xl | 48px | gap-12 |

### Border & Shadow

| Token | Value |
|-------|-------|
| --radius-sm | 6px |
| --radius-md | 8px |
| --radius-lg | 12px |
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.1) |

### Component Patterns

**Agent Card:** Avatar (gradient bg), name, role badge, weekly price, success rate bar, 2 sample outputs truncated, "Hire" CTA.

**Kanban Card:** Status color-coded left border, agent avatar, goal (truncated), progress bar (running), cost + duration (completed), error message (failed).

**KPI Card:** Label (muted), large value, delta indicator (green up / red down).

**Status Badge:** Pill shape, color-coded: pending (slate), running (blue), completed (green), failed (red), active (green), cancelled (red).

---

## 2. Screen Flow

```
                ┌──────────┐
                │   S-00   │
                │ Landing  │
                │    /     │
                └────┬─────┘
                     │ [Sign In]
                     ▼
                ┌──────────┐
                │   S-01   │
                │ Sign In  │◄──── Logto Cloud OIDC
                └────┬─────┘
                     │ [Authenticated]
          ┌──────────┼──────────┐
          ▼          ▼          ▼
    ┌──────────┐ ┌────────┐ ┌────────┐
    │   S-02   │ │  S-06  │ │  S-04  │
    │Marketplace│ │ Tasks  │ │My Team │
    │ /agents  │ │ /tasks │ │/hired  │
    └────┬─────┘ └───┬────┘ └───┬────┘
         │           │          │
         ▼           ▼          ▼
    ┌──────────┐ ┌────────┐ ┌────────┐
    │   S-03   │ │  S-07  │ │  S-05  │
    │  Detail  │ │ Create │ │  Hire  │
    │/agents/id│ │/tasks/ │ │ Detail │
    └──────────┘ │  new   │ └────────┘
         │       └───┬────┘
         │ [Hire]    │ [Submit]
         ▼           ▼
    ┌──────────┐ ┌────────┐
    │   S-04   │ │  S-08  │
    │ My Team  │ │ Task   │
    │ (refresh)│ │ Detail │
    └──────────┘ │/tasks/id│
                 └────────┘

Sidebar navigation: S-02, S-06, S-04, S-09, S-10 always accessible.
```

---

## 3. Screen Specifications

### S-00: Landing Page (`/`)

**Purpose:** Convert visitors to sign-ups. Public, no auth required.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [Logo]  Agents  Pricing  [Sign In]  [Get Started]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│           Hire Expert AI Agents                      │
│     Deploy specialists instantly. Weekly rental.     │
│     No hiring friction.                              │
│                                                      │
│           [Get Started — Free]                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Coder  │ │Research│ │   PM   │ │   QA   │       │
│  │ $50/wk │ │ $35/wk │ │ $45/wk │ │ $40/wk │       │
│  │ 94%    │ │  89%   │ │  91%   │ │  87%   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Pricing                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Solo    │ │  Team    │ │  Squad   │            │
│  │  $49/wk  │ │ $299/wk  │ │ $799/wk  │            │
│  │  1 agent │ │ 3 agents │ │ 5+ agents│            │
│  │ [Select] │ │ [Select] │ │ [Select] │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────────────────────────────────────┘
```

**Elements:**
- Navigation bar: logo, links, Sign In, CTA
- Hero: headline, subheadline, primary CTA
- Agent carousel: 4+ agent cards (horizontal scroll on mobile)
- Pricing grid: 3 tiers (Solo, Team, Squad)
- Footer: links, contact

**Transitions:**
- "Get Started" → S-01 Sign In (if unauthenticated) → S-02 Marketplace
- Agent card click → S-03 Agent Detail

---

### S-02: Agent Marketplace (`/agents`)

**Purpose:** Browse and discover agents to hire.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Hire Expert AI Agents            [dark toggle]  │
│ SIDE │                                                  │
│ BAR  │  [🔍 Search agents...]  [Role ▼] [Cost ▼]       │
│      │                                                  │
│ ● Ag │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ ○ Ta │  │ Coder  │ │Research│ │   PM   │ │   QA   │   │
│ ○ My │  │ 💻     │ │ 🔍    │ │ 📋    │ │ 🧪    │   │
│ ○ Bi │  │ 94%    │ │  89%   │ │  91%   │ │  87%   │   │
│      │  │ $50/wk │ │ $35/wk │ │ $45/wk │ │ $40/wk │   │
│      │  │ [Hire] │ │ [Hire] │ │ [Hire] │ │ [Hire] │   │
│      │  └────────┘ └────────┘ └────────┘ └────────┘   │
│      │                                                  │
│      │  ┌────────┐ ┌────────┐ ┌────────┐              │
│      │  │Copywrt │ │ Image* │ │ Video* │              │
│      │  │ ✍️     │ │ 🎨    │ │ 🎬    │              │
│      │  │  93%   │ │ Coming │ │ Coming │              │
│      │  │ $30/wk │ │  Soon  │ │  Soon  │              │
│      │  │ [Hire] │ │ [Wait] │ │ [Wait] │              │
│      │  └────────┘ └────────┘ └────────┘              │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Search input (debounced, searches name + role)
- Filter dropdowns: Role (All, Coder, Research, PM, QA, Copywriter), Cost range
- 4-column responsive grid (4 cols desktop, 2 tablet, 1 mobile)
- Agent cards: avatar (gradient bg), name, role, success rate, weekly price, "Hire" CTA
- Pagination (bottom, if >8 agents)

**Data Sources:**
- Agents: `GET /agents?role=&cost_min=&cost_max=&sort=`

**Transitions:**
- Card click → S-03 Agent Detail
- "Hire" button → S-03 (scroll to pricing section)

---

### S-03: Agent Detail (`/agents/[id]`)

**Purpose:** Full agent profile — convince user to hire.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  ┌────────────────────────────────────────────┐  │
│ SIDE │  │ 💻 Coder Agent                    [← Back] │  │
│ BAR  │  │ "Expert coder for bugs, PRs, and tests"    │  │
│      │  │ Tools: Code Interpreter, GitHub, Terminal   │  │
│      │  │                           [Hire This Agent] │  │
│      │  └────────────────────────────────────────────┘  │
│      │                                                  │
│      │  ┌──────────┐┌──────────┐┌──────────┐┌────────┐ │
│      │  │Success   ││Avg Cost  ││Avg Time  ││ Tasks  │ │
│      │  │ 94%      ││ $2.37    ││ 45s      ││  523   │ │
│      │  └──────────┘└──────────┘└──────────┘└────────┘ │
│      │                                                  │
│      │  Sample Outputs ──────────────────────────       │
│      │  ┌──────────────────┐ ┌──────────────────┐      │
│      │  │ "Fixed auth bug" │ │ "Wrote unit tests"│      │
│      │  │  snippet...      │ │  snippet...       │      │
│      │  └──────────────────┘ └──────────────────┘      │
│      │                                                  │
│      │  Reviews ─────────────────────────────────       │
│      │  ⭐⭐⭐⭐⭐ "Excellent work on our API..."    │
│      │  ⭐⭐⭐⭐  "Good but took longer than..."     │
│      │                                                  │
│      │  Pricing ─────────────────────────────────       │
│      │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│      │  │  Solo    │ │  Team    │ │  Squad   │        │
│      │  │  $50/wk  │ │ included │ │ included │        │
│      │  │ [Hire]   │ │ [Hire]   │ │ [Hire]   │        │
│      │  └──────────┘ └──────────┘ └──────────┘        │
│      │                                                  │
│      │  ┌──────────────────────────────────────────┐   │
│      │  │     [Hire This Agent — $50/week]          │   │ ← Mobile sticky
│      │  └──────────────────────────────────────────┘   │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Hero: agent avatar (XL), name, role, bio, tools list, primary CTA
- Stats bar: 4 metrics (success rate, avg cost, avg runtime, total tasks)
- Sample outputs: 2-column grid, truncated task results
- Reviews: 3 recent reviews (star rating + comment + author)
- Pricing tiers: 3-tier grid (Solo, Team, Squad)
- Mobile: sticky bottom bar with "Hire" CTA

**Data Sources:**
- Agent: `GET /agents/{id}`

**Transitions:**
- "Hire" → `POST /agents/{id}/hire` → redirect to S-04 My Team

---

### S-04: My Team (`/agents/hired`)

**Purpose:** Manage hired agents — view status, edit settings, cancel/rehire.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  My Team                          [+ Hire More]  │
│ SIDE │                                                  │
│ BAR  │  [Active] [Cancelled]                            │
│      │                                                  │
│ ○ Ag │  ┌──────────────────────────────────────────┐    │
│ ○ Ta │  │ Agent    Status  Plan  Budget  Renews  ⚙ │    │
│ ● My │  │ Coder   🟢actv  solo  $100/w  Mar 19  ⚙ │    │
│ ○ Bi │  │ Research🟢actv  solo  $50/w   Mar 17  ⚙ │    │
│      │  │ PM      🔴canc  team   —      —       ↻ │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  Weekly Total: $150 / $200 budget                │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Tab filter: Active / Cancelled
- Data table: agent name, status badge, plan, weekly budget, renewal date, settings gear
- Gear icon opens settings modal (custom instructions + knowledge upload)
- Cancel / Rehire action buttons per row
- Weekly budget summary footer
- "+ Hire More" links to S-02

**Data Sources:**
- List: `GET /agents/hired`

**Transitions:**
- Row click → S-05 Hired Agent Detail
- Gear → settings modal (inline)
- "+ Hire More" → S-02 Marketplace

---

### S-05: Hired Agent Detail (`/agents/hired/[hireId]`)

**Purpose:** Deep view into a hired agent — costs, tasks, knowledge, settings.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  ← My Team    Coder Agent             🟢 Active  │
│ SIDE │  Role: Coder · LLM: Claude Sonnet · Plan: Solo  │
│ BAR  │                                                  │
│      │  Custom Instructions ─────────── [Edit]          │
│      │  "Focus on TypeScript, follow our code stds..."  │
│      │                                                  │
│      │  Knowledge Files ─────────────── [Upload]        │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ coding-standards.md   12KB  Mar 14  [✕]  │    │
│      │  │ api-conventions.md     8KB  Mar 14  [✕]  │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  Cost Overview ──── [This Week] [All Time]       │
│      │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│      │  │  Budget  │ │  Spent   │ │Remaining │        │
│      │  │  $100/wk │ │  $42.50  │ │  $57.50  │        │
│      │  └──────────┘ └──────────┘ └──────────┘        │
│      │                                                  │
│      │  Tasks (7 days) ────── ▓▓▓░░▓▓▓▓░▓▓             │
│      │  (bar chart: daily task count)                   │
│      │                                                  │
│      │  Recent Tasks ────────────────────────────       │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ Goal            Status  Cost    Date     │    │
│      │  │ Fix auth bug    ✅     $2.50   Mar 14    │    │
│      │  │ Write tests     ✅     $3.80   Mar 13    │    │
│      │  │ Review PR       ❌     $0.80   Mar 12    │    │
│      │  └──────────────────────────────────────────┘    │
│      │  [← Prev]  Page 1 of 3  [Next →]               │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Agent header: name, role, tools, LLM model, status badge, plan
- Custom instructions section + edit modal
- Knowledge files list (file_name, size, uploaded_at, delete button)
- Cost overview: 3 cards (budget, spent, remaining) + weekly/all-time toggle
- Tasks bar chart: daily task count for last 7 days
- Recent tasks table: paginated (goal, status, cost, date)

**Data Sources:**
- Detail: `GET /agents/hired/{hire_id}`
- Tasks: `GET /agents/hired/{hire_id}/tasks?page=&limit=10`

---

### S-06: Task Board (`/tasks`)

**Purpose:** Kanban view of all user tasks across all agents.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Task Board                       [+ New Task]   │
│ SIDE │                                                  │
│ BAR  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐│
│      │  │  Total   │ │ Success  │ │ Avg Time │ │Cost ││
│ ○ Ag │  │   47     │ │   91%    │ │   43s    │ │$142 ││
│ ● Ta │  └──────────┘ └──────────┘ └──────────┘ └─────┘│
│ ○ My │                                                  │
│ ○ Bi │  Queued     Running     Completed    Failed      │
│      │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│      │  │ #893   │ │ #892   │ │ #891   │ │ #890   │   │
│      │  │ PM     │ │ Coder  │ │ Research│ │ QA     │   │
│      │  │ Write  │ │ Fix bug│ │ Market │ │ Login  │   │
│      │  │ PRD... │ │ ████░░ │ │ $1.20  │ │ Timeout│   │
│      │  └────────┘ │ $1.80  │ │ 62s    │ │ [Retry]│   │
│      │             └────────┘ └────────┘ └────────┘   │
│      │                                                  │
│      │  [🔍 Search] [Agent ▼] [Priority ▼] [Date ▼]   │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- KPI metrics row: Total Tasks, Success Rate, Avg Duration, Total Cost
- 4 kanban columns: Queued, Running, Completed, Failed
- Kanban cards: agent avatar, goal (truncated), progress bar (running), cost + duration (completed), error + retry (failed)
- Filter bar: search, agent, priority, date range
- "+ New Task" links to S-07

**Data Sources:**
- Tasks: `GET /tasks` (grouped by status on frontend)

**Transitions:**
- Card click → S-08 Task Detail
- "+ New Task" → S-07 Create Task

---

### S-07: Create Task (`/tasks/new`)

**Purpose:** 5-step wizard to create and submit a task.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Create Task                                     │
│ SIDE │                                                  │
│ BAR  │  Step: ①── ②── ③── ④── ⑤                       │
│      │                                                  │
│      │  Step 1: Define Your Task ───────────────        │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ What do you need done?                    │    │
│      │  │ ┌──────────────────────────────────────┐  │    │
│      │  │ │ Write unit tests for the login flow  │  │    │
│      │  │ │ and auth middleware...                │  │    │
│      │  │ └──────────────────────────────────────┘  │    │
│      │  │                              143 / 2000   │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │                         [Back]  [Next →]         │
└──────┴──────────────────────────────────────────────────┘
```

**Steps:**
1. **Goal** — Textarea with character counter (max 2000)
2. **Context** — Drop zone for PDFs/markdown (visual only MVP)
3. **Agent** — Radio grid: select from hired agents or marketplace agents
4. **Budget** — Slider ($10–$500) with cost estimate preview
5. **Review** — Summary table + Submit button

**Data Sources:**
- Submit: `POST /tasks` (with optional hire_id)

**Transitions:**
- Submit → redirect to S-06 Task Board (task appears in Queued)

---

### S-08: Task Detail (`/tasks/[id]`)

**Purpose:** Full task results, metrics, output, rating.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Task #892: Fix auth bug          ✅ Completed   │
│ SIDE │  Agent: Coder · Priority: High    [Re-run][Share]│
│ BAR  │                                                  │
│      │  ┌────────┐┌────────┐┌────────┐┌────────┐      │
│      │  │Duration││  Cost  ││ Tokens ││ Tools  │      │
│      │  │  45s   ││ $2.50  ││ 3,400  ││   4    │      │
│      │  └────────┘└────────┘└────────┘└────────┘      │
│      │                                                  │
│      │  Cost Breakdown ──────────────────────────       │
│      │  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  Input: $0.80               │
│      │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Output: $1.40              │
│      │  ▓▓▓▓░░░░░░░░░░░░░░  Tools: $0.30               │
│      │                                                  │
│      │  Output ── [Report] [Code] [Trace] [Tools]       │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ ## Auth Bug Fix Report                    │    │
│      │  │ Found issue in jwt_handler.py line 42...  │    │
│      │  │ ### Changes Made                          │    │
│      │  │ - Fixed token expiry check...             │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  Timeline ────────────────────────────────       │
│      │  ● 10:30:23  Agent started                       │
│      │  ● 10:30:45  Analyzing code (code_interpreter)   │
│      │  ● 10:31:02  Found bug in auth module            │
│      │  ● 10:31:15  Writing fix                         │
│      │  ● 10:31:30  Running tests                       │
│      │  ✓ 10:31:45  Task completed                      │
│      │                                                  │
│      │  Rate This Agent ─────────────────────────       │
│      │  ⭐⭐⭐⭐⭐  [Submit Rating]                   │
│      │                                                  │
│      │  [Hire Again]  [Back to Board]  [Browse Agents]  │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Task header: goal, status badge, agent, priority, Re-run/Share buttons
- 4-metric grid: Duration, Cost, Tokens, Tool Calls
- Cost breakdown: stacked bar (input/output/tools segments)
- Tabbed output: Report (markdown), Code (syntax highlighted), Reasoning Trace, Tool Calls
- Execution timeline: vertical line with colored entries
- Rating form: 5-star interactive + optional comment
- Bottom actions: Hire Again, Back to Board, Browse Agents

**Data Sources:**
- Task: `GET /tasks/{id}`
- Stream: `GET /tasks/{id}/stream` (SSE, while status = running)

---

### S-09: Billing (`/billing`)

**Purpose:** Subscription management, usage tracking, invoices.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Billing                                         │
│ SIDE │                                                  │
│ BAR  │  Current Plan ──────────────────── [Change Plan] │
│      │  ┌──────────────────────────────────────────┐    │
│ ○ Ag │  │  Solo Plan · $49/week · Renews Mar 19    │    │
│ ○ Ta │  │  1 agent · $100 weekly budget             │    │
│ ○ My │  └──────────────────────────────────────────┘    │
│ ● Bi │                                                  │
│      │  This Week's Usage ───────────────────────       │
│      │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│      │  │  Tasks   │ │  Cost    │ │ Budget   │        │
│      │  │   12     │ │  $42.50  │ │ 42% used │        │
│      │  └──────────┘ └──────────┘ └──────────┘        │
│      │                                                  │
│      │  Cost by Agent ───────────────────────────       │
│      │  Coder      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  $32.00             │
│      │  Research   ▓▓▓▓▓           $10.50              │
│      │                                                  │
│      │  Invoices ────────────────────────────────       │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ Date       Amount  Status     Download   │    │
│      │  │ Mar 12     $49.00  ✅ Paid    [PDF]      │    │
│      │  │ Mar 5      $49.00  ✅ Paid    [PDF]      │    │
│      │  └──────────────────────────────────────────┘    │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Current plan card: tier name, price, renewal date, agent count, budget
- "Change Plan" links to tier selection modal
- Usage KPIs: tasks this week, cost this week, budget utilization %
- Cost by agent: horizontal bar chart
- Invoice history table: date, amount, status badge, download PDF

**Data Sources:**
- Subscription: `GET /subscriptions` (future)
- Usage: derived from `GET /tasks` (filtered current week)

---

## 4. Shared Components

### Sidebar Navigation

```
┌────────────────────┐
│ Agent Foundry      │
│                    │
│ 🏪 Marketplace    │  ← /agents
│ 📋 Tasks          │  ← /tasks
│ 👥 My Team        │  ← /agents/hired
│ 💳 Billing        │  ← /billing
│                    │
│ ────────────────── │
│ ⚙ Settings        │  ← /settings
│ [☀/🌙]            │  ← Theme toggle
└────────────────────┘
```

- Width: 240px (desktop), hidden (mobile → hamburger menu)
- Active state: subtle background + 2px left border accent
- Collapsible on tablet (icons only)

### Mobile Navigation

- Hamburger menu (top-left)
- Bottom tab bar: Agents, Tasks, My Team, Billing (4 items)
- Sticky header with page title

---

## 5. Design Rationale

| Decision | Rationale |
|----------|-----------|
| Dark mode default | Modern SaaS aesthetic; target users are developers/tech teams |
| 4-column agent grid | Maximizes agent visibility; responsive down to 1-col mobile |
| Kanban for tasks | Familiar pattern (Trello/Linear); instant status overview |
| 5-step task wizard | Progressive disclosure; prevents overwhelming single-page form |
| Sticky "Hire" on mobile | Critical CTA always accessible; reduces drop-off |
| Sidebar nav (not top) | 5+ nav items; sidebar scales better; consistent with admin panel |
| Server-side pagination | Scales to 100K+ tasks without client memory issues |
| SSE for live updates | Real-time feel without WebSocket complexity |
| Tabbed output | Multiple output types (report, code, trace) without page sprawl |

---

## 6. CJX Stage Mapping

| Screen | CJX Stage | Intent |
|--------|-----------|--------|
| S-00 Landing | Onboarding | Awareness, conversion to sign-up |
| S-01 Sign In | Onboarding | Authentication |
| S-02 Marketplace | Discovery | Explore available agents |
| S-03 Agent Detail | Discovery | Evaluate agent capabilities |
| S-04 My Team | Usage | Manage hired agents |
| S-05 Hired Agent Detail | Usage | Configure + monitor specific agent |
| S-06 Task Board | Usage | Monitor all active work |
| S-07 Create Task | Usage | Submit new work to agents |
| S-08 Task Detail | Usage | Review results, rate quality |
| S-09 Billing | Retention | Manage subscription, track spend |
| S-10 Settings | Retention | Profile management, API keys |

---

## GATE 2: Requirements Validation

Before proceeding to `/ipa:design`:

- [ ] Stakeholders reviewed SRD.md
- [ ] Feature priorities (P0/P1/P2/P3) confirmed
- [ ] Scope matches existing codebase (Phases 1–2 implemented)
- [ ] No scope creep detected
- [ ] Design system consistent with `docs/design-guidelines.md`

**Next:** `/ipa:design` to generate HTML prototypes from this UI_SPEC

---

## Document Metadata
- **Version:** 1.0
- **Created:** 2026-03-15
- **Owner:** Product (Solo Founder)
- **Status:** Draft — pending GATE 2 validation
- **SRD Reference:** docs/SRD.md
- **Admin UI_SPEC:** docs/admin-ui-spec.md
- **Design System:** docs/design-guidelines.md
