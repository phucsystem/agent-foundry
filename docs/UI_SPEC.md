# Basic Design (UI Specification) — Super Admin Page

## 1. Design System

### Reference Source
- Style: Vercel-inspired minimal dark mode
- Inspiration: Vercel Dashboard, Linear App
- Extracted: 2026-03-15

### Color Palette (Admin-Specific)

Inherits from `docs/design-guidelines.md` with admin-specific overrides:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --admin-bg | #FFFFFF | #0A0A0A | Page background (pure black for Vercel feel) |
| --admin-surface | #FAFAFA | #111111 | Card/panel background |
| --admin-surface-hover | #F5F5F5 | #1A1A1A | Hover state on cards/rows |
| --admin-border | #EAEAEA | #222222 | Borders, dividers |
| --admin-text-primary | #000000 | #EDEDED | Primary text |
| --admin-text-secondary | #666666 | #888888 | Secondary/muted text |
| --admin-text-tertiary | #999999 | #555555 | Captions, timestamps |
| --admin-accent | #3B82F6 | #3B82F6 | Primary accent (blue, same both modes) |
| --admin-success | #10B981 | #10B981 | Positive metrics, active status |
| --admin-warning | #F59E0B | #F59E0B | Caution, renewing_soon |
| --admin-error | #EF4444 | #EF4444 | Failures, cancelled |
| --admin-chart-1 | #3B82F6 | #3B82F6 | Revenue line |
| --admin-chart-2 | #10B981 | #10B981 | Tasks line |
| --admin-chart-3 | #8B5CF6 | #8B5CF6 | Users line (purple) |
| --admin-chart-expense | #EF4444 | #EF4444 | Expense line (red) |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| --font-admin | 'Inter', -apple-system, system-ui, sans-serif | All admin text |
| --admin-h1 | 24px / 700 | Page titles |
| --admin-h2 | 18px / 600 | Section headings |
| --admin-h3 | 14px / 600 | Card titles, column headers |
| --admin-body | 14px / 400 | Table cells, descriptions |
| --admin-caption | 12px / 400 | Timestamps, helper text |
| --admin-kpi-value | 32px / 700 | KPI card numbers |
| --admin-kpi-label | 12px / 500 | KPI card labels (uppercase tracking) |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| --admin-page-x | 32px | Horizontal page padding |
| --admin-page-y | 24px | Vertical page padding |
| --admin-section-gap | 24px | Gap between sections |
| --admin-card-padding | 20px | Card internal padding |
| --admin-card-gap | 16px | Gap between KPI cards |
| --admin-table-row-h | 48px | Table row height |

### Border & Shadow

| Token | Light | Dark |
|-------|-------|------|
| --admin-radius-sm | 6px | 6px |
| --admin-radius-md | 8px | 8px |
| --admin-radius-lg | 12px | 12px |
| --admin-shadow | 0 1px 3px rgba(0,0,0,0.04) | none |
| --admin-border-width | 1px | 1px |

### Component Patterns

**KPI Card:** Minimal card with label (uppercase, muted), large value, optional delta badge (+12%).
```
┌──────────────────┐
│ MONTHLY REVENUE  │  ← --admin-kpi-label, uppercase, letter-spacing
│ $4,200           │  ← --admin-kpi-value
│ ↑ 12% vs last wk │  ← --admin-caption + success/error color
└──────────────────┘
```

**Data Table:** Clean rows, no zebra stripes, subtle hover, right-aligned numbers.

**Sidebar:** Narrow (240px), icon + label nav items, active state = subtle background + accent border-left.

**Charts:** Recharts with admin palette. Minimal grid lines. Tooltip on hover. No legends if single series.

---

## 2. Screen Flow

```
                    ┌─────────────┐
                    │  /admin     │
                    │  Dashboard  │
                    │  (S-A00)    │
                    └──────┬──────┘
           ┌───────────┬───┴───┬───────────┬──────────┐
           ▼           ▼       ▼           ▼          ▼
     ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
     │ /admin/  │ │/admin/ │ │/admin/ │ │/admin/ │ │/admin/ │
     │ users    │ │subscr. │ │rev&exp │ │agents  │ │health  │
     │ (S-A01)  │ │(S-A02) │ │(S-A03) │ │(S-A04) │ │(S-A05) │
     └──────────┘ └────────┘ └────────┘ └────────┘ └────────┘

Navigation: Sidebar always visible. All screens accessible from any other.
Dashboard links: KPI cards link to respective detail screens.
```

---

## 3. Screen Specifications

### S-A00: Admin Dashboard (`/admin`)

**Purpose:** At-a-glance platform overview. North Star metric: MRR (top-left).

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Admin Dashboard                  [dark toggle]  │
│ SIDE │                                                  │
│ BAR  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│      │  │   MRR    │ │  Users   │ │  Tasks   │ │Error ││
│ ● Ov │  │  $4,200  │ │   127    │ │  892     │ │ 2.1% ││
│ ○ Us │  │  ↑ 12%   │ │  ↑ 8    │ │  today:47│ │ ↓0.3%││
│ ○ Su │  └──────────┘ └──────────┘ └──────────┘ └──────┘│
│ ○ Re │                                                  │
│ ○ Ag │  Revenue (7 days) ──────────────────────────     │
│ ○ He │  ┌──────────────────────────────────────────┐    │
│      │  │  📈 Mini line chart (daily revenue)      │    │
│      │  │     Last 7 days, single blue line        │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  Recent Users ──────────────────── [View all →]  │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ Email          Tier    Joined     Tasks   │    │
│      │  │ john@ex.com    pro     Mar 12     23      │    │
│      │  │ sara@ex.com    free    Mar 10     5       │    │
│      │  │ dev@ex.com     team    Mar 8      41      │    │
│      │  └──────────────────────────────────────────┘    │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- 4x KPI cards (MRR, Total Users, Total Tasks, Error Rate) — clickable, link to detail screens
- Mini revenue line chart (last 7 days, compact, no axis labels)
- Recent users table (5 rows, columns: email, tier, joined, task count)
- "View all →" link to S-A01

**Data Sources:**
- KPIs: `GET /api/admin/stats`
- Chart: `GET /api/admin/revenue?period=7d`
- Users: `GET /api/admin/users?limit=5&sort=created_at:desc`

**Transitions:**
- Click MRR card → S-A03 Revenue & Expenses
- Click Users card → S-A01 Users
- Click Tasks card → S-A04 Agent Operations
- Click Error card → S-A05 Health
- Click "View all →" → S-A01 Users

---

### S-A01: User Management (`/admin/users`)

**Purpose:** Browse, search, and manage platform users.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Users                              127 total    │
│ SIDE │                                                  │
│ BAR  │  [🔍 Search by email...]  [Tier ▼] [Sort ▼]     │
│      │                                                  │
│ ○ Ov │  ┌──────────────────────────────────────────┐    │
│ ● Us │  │ Email        Name     Tier   Joined  Tasks│    │
│ ○ Su │  │ john@...     John D   pro    Mar 12   23  │    │
│ ○ Re │  │ sara@...     Sara L   free   Mar 10   5   │    │
│ ○ Ag │  │ dev@...      Dev T    team   Mar 8    41  │    │
│ ○ He │  │ ...          ...      ...    ...      ... │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  [← Prev]  Page 1 of 3  [Next →]               │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Search input (debounced, searches email and name)
- Tier filter dropdown (All, free, pro, team, super_admin)
- Sort dropdown (Newest, Oldest, Most Tasks)
- Data table: email, name, tier (badge), joined date, task count
- Pagination (server-side, 50 per page)
- Row click opens **detail drawer** (slide-in from right)

**Detail Drawer:**
```
┌─────────────────────────┐
│ ✕  User Detail          │
│                         │
│ john@example.com        │
│ John Doe                │
│ Tier: [pro ▼]           │
│ Joined: 2026-03-12      │
│ API Key: ****-abcd      │
│                         │
│ ── Hired Agents (2) ──  │
│ Coder    active  $100/w │
│ Research active  $50/w  │
│                         │
│ ── Recent Tasks (5) ──  │
│ #892 coder   ✅ $2.50  │
│ #891 research ✅ $1.20  │
│ #890 coder   ❌ $0.80  │
│                         │
│ [Suspend User]          │
└─────────────────────────┘
```

**Data Sources:**
- List: `GET /api/admin/users?search=&tier=&sort=&page=&limit=50`
- Detail: `GET /api/admin/users/{id}`
- Actions: `PUT /api/admin/users/{id}` (tier change, suspend)

---

### S-A02: Subscriptions (`/admin/subscriptions`)

**Purpose:** Overview of all active/cancelled agent hires across all users.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Subscriptions                    42 total       │
│ SIDE │                                                  │
│ BAR  │  [Status ▼: All]  [Agent ▼: All]                │
│      │                                                  │
│ ○ Ov │  ┌──────────────────────────────────────────┐    │
│ ○ Us │  │ User        Agent    Status  Budget  Renews│    │
│ ● Su │  │ john@..     Coder   🟢active $100   Mar 19│    │
│ ○ Re │  │ sara@..     Research🟡renew  $50    Mar 17│    │
│ ○ Ag │  │ dev@..      PM      🔴cancel  -    Mar 15│    │
│ ○ He │  │ ...         ...     ...     ...    ...    │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  Summary: 35 active · 3 renewing · 4 cancelled  │
│      │  Total weekly budget: $4,250                     │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Status filter (All, Active, Renewing Soon, Cancelled, Expired)
- Agent filter (All, Coder, Research, PM, QA, Copywriter)
- Data table: user email, agent name, status badge, weekly budget, renewal date
- Summary footer: counts by status + total weekly budget
- Row click → user detail drawer (same as S-A01)

**Data Sources:**
- List: `GET /api/admin/subscriptions?status=&agent=&page=&limit=50`

---

### S-A03: Revenue & Expenses (`/admin/revenue`)

**Purpose:** Revenue and expense analytics — MRR, net profit, trends, per-agent breakdown.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Revenue & Expenses    [📅 date range] [7d][30d][90d]│
│ SIDE │                                                  │
│ BAR  │  ┌──────────────────────────┐ ┌──────────────┐  │
│      │  │  Revenue & Exp Over Time │ │  MRR         │  │
│ ○ Ov │  │  ● Revenue ● Expenses   │ │  $4,200      │  │
│ ○ Us │  │  ┌────────────────────┐  │ │  ↑ 12%      │  │
│ ○ Su │  │  │ 📈 Dual line chart │  │ ├──────────────┤  │
│ ● Re │  │  │  (2/3 width)       │  │ │  Tot Revenue │  │
│ ○ Ag │  │  │  Blue=rev Red=exp  │  │ │  $12,400     │  │
│ ○ He │  │  └────────────────────┘  │ ├──────────────┤  │
│      │  └──────────────────────────┘ │  Tot Expenses│  │
│      │                               │  $3,820      │  │
│      │                               ├──────────────┤  │
│      │                               │  Net Profit  │  │
│      │                               │  $8,580      │  │
│      │                               ├──────────────┤  │
│      │                               │  Avg Cost/Tk │  │
│      │                               │  $3.82       │  │
│      │                               └──────────────┘  │
│      │                                                  │
│      │  Revenue & Expenses by Agent ───────────────     │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ Agent     Tasks  Revenue  Expense  Profit │    │
│      │  │ Coder     523   $1,240   $380     $860    │    │
│      │  │ Research  312   $480     $145     $335    │    │
│      │  │ PM        98    $290     $88      $202    │    │
│      │  │ QA        45    $110     $34      $76     │    │
│      │  │ Copywriter 22   $38      $12      $26     │    │
│      │  └──────────────────────────────────────────┘    │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Date range picker (start date – end date inputs) + period shortcut tabs (7d, 30d, 90d)
- Split layout: chart (2/3 width, left) + metrics sidebar (1/3 width, right)
- Chart: dual line chart — daily revenue (blue) and daily expenses (red) with gradient area fill, legend in chart header
- 5x metric cards stacked vertically on right: MRR (↑12%), Total Revenue, Total Expenses (red), Net Profit (green), Avg Cost/Task
- Revenue & Expenses by Agent table: agent name, task count, total revenue, total expense (LLM cost), profit — sorted by revenue desc

**Data Sources:**
- KPIs: `GET /api/admin/revenue?period=30d`
- Chart: `GET /api/admin/revenue?period=30d` (includes `daily_revenue_series` and `daily_expense_series` arrays)
- Breakdown: `GET /api/admin/revenue/breakdown?period=30d` (includes expense and profit per agent)

---

### S-A04: Agent Operations (`/admin/agents`)

**Purpose:** Monitor agent health and moderate tasks.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Agent Operations                                │
│ SIDE │                                                  │
│ BAR  │  Agent Performance ─────────────────────────     │
│      │  ┌──────────────────────────────────────────┐    │
│ ○ Ov │  │ Agent     Success  AvgTime  AvgCost Tasks │    │
│ ○ Us │  │ Coder     94%      45s      $2.37   523   │    │
│ ○ Su │  │ Research  89%      62s      $1.54   312   │    │
│ ○ Re │  │ PM        91%      38s      $2.96   98    │    │
│ ● Ag │  │ QA        87%      55s      $2.44   45    │    │
│ ○ He │  │ Copywriter 93%     22s      $1.73   22    │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  Recent Tasks ── [Status ▼] [Agent ▼] ──────    │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ ID    Agent    Goal (trunc)  Status Cost  │    │
│      │  │ #892  Coder    Fix auth bug  ✅    $2.50  │    │
│      │  │ #891  Research Market analys ✅    $1.20  │    │
│      │  │ #890  QA       Test login    ❌    $0.80  │    │
│      │  │ #889  PM       Write PRD     ⏳    $0.00  │    │
│      │  └──────────────────────────────────────────┘    │
│      │  [← Prev]  Page 1 of 18  [Next →]              │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- Agent Performance table: agent name, success rate (color-coded: green >90%, yellow 80-90%, red <80%), avg runtime, avg cost, total tasks
- Recent Tasks table: task ID, agent, goal (truncated 40 chars), status badge, cost
- Status filter (All, Pending, Running, Completed, Failed)
- Agent filter dropdown
- Pagination (50 per page)
- Row click on task → links to existing `/tasks/{id}` detail page

**Data Sources:**
- Performance: `GET /api/admin/agents/performance`
- Tasks: `GET /api/admin/tasks?status=&agent=&page=&limit=50`

---

### S-A05: Platform Health (`/admin/health`)

**Purpose:** System monitoring — LLM costs, errors, worker health.

**Layout:**
```
┌──────┬──────────────────────────────────────────────────┐
│      │  Platform Health                                 │
│ SIDE │                                                  │
│ BAR  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│      │  │LLM Cost  │ │Error Rate│ │Avg Runtim│        │
│ ○ Ov │  │$142 today│ │ 2.1%     │ │  43s     │        │
│ ○ Us │  │↑ $18     │ │ ↓ 0.3%   │ │ ↑ 2s     │        │
│ ○ Su │  └──────────┘ └──────────┘ └──────────┘        │
│ ○ Re │                                                  │
│ ○ Ag │  LLM Cost Trend (7d) ──────────────────────     │
│ ● He │  ┌──────────────────────────────────────────┐    │
│      │  │  📈 Line chart: daily LLM spend           │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  Error Log ─────────────────────────────────     │
│      │  ┌──────────────────────────────────────────┐    │
│      │  │ Time       Task   Agent   Error Message   │    │
│      │  │ 14:23      #890   QA      Timeout after.. │    │
│      │  │ 13:01      #887   Coder   API rate limit  │    │
│      │  │ 11:45      #882   PM      Invalid output  │    │
│      │  └──────────────────────────────────────────┘    │
│      │                                                  │
│      │  System Status ─────────────────────────────     │
│      │  │ API Server     🟢 Running                │    │
│      │  │ Celery Worker  🟢 Running (3 active)     │    │
│      │  │ Redis          🟢 Connected              │    │
│      │  │ PostgreSQL     🟢 Connected              │    │
│      │  │ LiteLLM        🟢 Healthy                │    │
└──────┴──────────────────────────────────────────────────┘
```

**Elements:**
- 3x KPI cards: LLM Cost Today, Error Rate (7d), Avg Runtime
- LLM Cost Trend chart (last 7 days, orange/amber line)
- Error Log table: recent failed tasks with timestamps, limited to 20 rows
- System Status list: service name + health indicator (green/red dot)

**Data Sources:**
- All: `GET /api/admin/health`
- Errors: `GET /api/admin/tasks?status=failed&limit=20&sort=created_at:desc`

---

## 4. Shared Components

### Admin Sidebar

```
┌────────────────────┐
│ Agent Foundry      │
│ ADMIN              │
│                    │
│ ● Overview         │  ← Active: bg-surface + left accent border
│ ○ Users            │
│ ○ Subscriptions    │
│ ○ Revenue & Exp    │
│ ○ Agents           │
│ ○ Health           │
│                    │
│ ────────────────── │
│ ← Back to App      │  ← Returns to user-facing /agents
│                    │
│ [☀/🌙]             │  ← Theme toggle at bottom
└────────────────────┘
```

- Width: 240px (fixed, not collapsible for MVP)
- Icon + label for each nav item
- Active state: subtle background + 2px left border in accent color
- "Back to App" link at bottom to exit admin

### Admin KPI Card

Reusable component for all dashboard metric cards:
- Label: uppercase, --admin-kpi-label
- Value: large, --admin-kpi-value
- Delta: small, colored (green positive, red negative)
- Optional: click handler to navigate to detail screen

### Admin Data Table

Reusable table component:
- Server-side pagination (page, limit params)
- Column sorting (sort param)
- Row hover highlight
- Optional row click handler
- Loading skeleton state
- Empty state message

---

## 5. Design Rationale

| Decision | Rationale |
|----------|-----------|
| Dark mode default | Vercel-inspired; admin = power user tool; reduces eye strain for extended monitoring |
| Pure black (#0A0A0A) background | Matches Vercel aesthetic, high contrast with content |
| No zebra stripes in tables | Cleaner minimal look; hover state sufficient for row tracking |
| Sidebar navigation (not top tabs) | More nav items (6 screens); sidebar scales better than horizontal tabs |
| Drawer for user detail (not new page) | Quick glance without losing table context; faster navigation |
| KPI cards link to detail screens | Progressive disclosure; dashboard → detail is natural flow |
| Server-side pagination | Scales to 10K+ users/100K+ tasks without client memory issues |
| Recharts for charts | Already in React ecosystem; lightweight; good dark mode support |
| No mobile responsive | Admin is desktop-only tool for solo founder; reduces scope |

---

## 6. CJX Stage Mapping

| Screen | CJX Stage | Intent |
|--------|-----------|--------|
| S-A00 Dashboard | Usage | Daily check-in, quick health scan |
| S-A01 Users | Usage | User investigation, tier management |
| S-A02 Subscriptions | Retention | Monitor churn, track renewals |
| S-A03 Revenue & Expenses | Usage | Business health, growth tracking, cost control |
| S-A04 Agents | Usage | Quality monitoring, issue detection |
| S-A05 Health | Usage | System reliability, cost control |

---

## 🚦 GATE 2: Requirements Validation

Before proceeding to `/ipa:design`:

- [ ] Stakeholders reviewed SRD.md
- [ ] Feature priorities (P1/P2/P3) confirmed
- [ ] Scope still matches /lean output (3 phases, 5+1 screens, 11 endpoints)
- [ ] No scope creep detected
- [ ] Design style confirmed (Vercel minimal dark)

**Next:** `/ipa:design` to generate HTML prototypes from this UI_SPEC

---

## Document Metadata
- **Version:** 1.0
- **Created:** 2026-03-15
- **Owner:** Product (Solo Founder)
- **Status:** Draft — pending GATE 2 validation
- **SRD Reference:** docs/SRD.md
- **Lean Report:** plans/reports/lean-20260315-super-admin-page.md
