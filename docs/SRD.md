# System Requirement Definition (SRD) — Super Admin Page

## 1. System Overview

Add a platform administration interface to Agent Foundry, enabling the solo founder to monitor business metrics, manage users, track revenue, oversee agent operations, and check platform health — all from a single dashboard.

**Scope:** Internal-only admin panel at `/admin/*` routes. No public access. No RBAC (single super_admin user).

**Context:** Aligns with Phase 3 Week 10 roadmap deliverable. All data sourced from existing database tables — no new tables required.

---

## 2. Actors (User Roles)

| Actor | Description | Access |
|-------|-------------|--------|
| Super Admin | Platform owner (solo founder) | Full read/write access to all admin screens |
| System | Automated data aggregation | Provides KPI calculations, health metrics |

**Auth:** User with `tier = 'super_admin'` in `users` table. All `/api/admin/*` endpoints reject non-super_admin requests with `403`.

---

## 3. Functional Requirements (FR-xx)

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-A01 | Admin Dashboard KPIs | P1 | Display key metrics: total users, active hires, MRR, tasks today, error rate |
| FR-A02 | User Management | P1 | List all users with search, filter by tier, view user detail (hires + tasks) |
| FR-A03 | User Actions | P3 | Suspend/unsuspend user, change tier |
| FR-A04 | Subscription Overview | P1 | List all hired_agents with status, user info, renewal dates |
| FR-A05 | Subscription Actions | P3 | Cancel/extend hire on behalf of user |
| FR-A06 | Revenue KPIs | P1 | Show MRR, total revenue, average cost per task, profit margin estimate |
| FR-A07 | Revenue Charts | P2 | Daily and weekly revenue trend line charts |
| FR-A08 | Revenue Breakdown | P2 | Cost breakdown by agent (bar chart or table) |
| FR-A09 | Agent Performance Table | P2 | Per-agent: success rate, avg runtime, avg cost, total tasks |
| FR-A10 | Task Moderation List | P2 | Paginated task list with status/agent/date filters |
| FR-A11 | Platform Health | P2 | LLM cost trends, error rate, active worker count |
| FR-A12 | Admin Auth Guard | P1 | Middleware rejecting non-super_admin users on all admin routes |

---

## 4. Screen List (S-xx)

| ID | Screen Name | Route | Description |
|----|-------------|-------|-------------|
| S-A00 | Admin Dashboard | /admin | Overview KPI cards + mini revenue chart + recent users table |
| S-A01 | User Management | /admin/users | Searchable user table with tier filter + detail drawer |
| S-A02 | Subscriptions | /admin/subscriptions | All hired agents table with status filter + user link |
| S-A03 | Revenue | /admin/revenue | MRR card + revenue line chart + agent cost breakdown |
| S-A04 | Agent Operations | /admin/agents | Agent performance table + recent tasks list |
| S-A05 | Platform Health | /admin/health | System health cards: LLM costs, errors, workers |

---

## 5. Entity List (E-xx)

No new entities. All admin data derived from existing tables:

| ID | Entity | Source Table | Admin Usage |
|----|--------|-------------|-------------|
| E-01 | User | `users` | User list, count, tier distribution |
| E-02 | HiredAgent | `hired_agents` | Subscription list, MRR calculation |
| E-03 | Task | `tasks` | Revenue (cost_usd), agent performance, task moderation |
| E-04 | AgentConfig | `agent_configs` | Agent catalog reference for names/roles |

### Derived Metrics (Computed, Not Stored)

| Metric | Formula | Source |
|--------|---------|--------|
| MRR | `SUM(weekly_budget_usd) * 4.33` from active hired_agents | E-02 |
| Total Revenue | `SUM(cost_usd)` from completed tasks | E-03 |
| Avg Cost/Task | `AVG(cost_usd)` from completed tasks | E-03 |
| Success Rate | `COUNT(status='completed') / COUNT(*)` per agent | E-03 |
| Error Rate | `COUNT(status='failed') / COUNT(*)` for recent tasks | E-03 |
| Active Users | `COUNT(DISTINCT user_id)` from tasks in last 7 days | E-03 |

---

## 6. Non-Functional Requirements

### Performance
- Dashboard KPIs load in < 1s (use indexed queries, consider caching for aggregates)
- User/task tables paginated (50 rows default, server-side pagination)
- Revenue charts compute from pre-aggregated data or lightweight queries

### Security
- All `/api/admin/*` endpoints require `super_admin` tier check
- Admin routes not discoverable from user-facing navigation
- No sensitive data exposed in client-side bundles (API keys, passwords)

### Usability
- Desktop-only for MVP (no mobile responsiveness required)
- Dark mode default (Vercel-inspired), light mode toggle available
- Keyboard navigable tables (Tab, Enter for row actions)

### Scalability
- Queries should perform well up to 10K users, 100K tasks
- Add database indexes if aggregation queries become slow
- Consider materialized views for revenue aggregates at scale

---

## 7. API Endpoints

| Method | URL | FR | Description |
|--------|-----|----|-------------|
| GET | /api/admin/stats | FR-A01 | Dashboard KPIs |
| GET | /api/admin/users | FR-A02 | Paginated user list (search, filter) |
| GET | /api/admin/users/{id} | FR-A02 | User detail + hires + tasks |
| PUT | /api/admin/users/{id} | FR-A03 | Update tier, suspend/unsuspend |
| GET | /api/admin/subscriptions | FR-A04 | All hired_agents with user info |
| PUT | /api/admin/subscriptions/{id} | FR-A05 | Cancel/extend hire |
| GET | /api/admin/revenue | FR-A06, FR-A07 | Revenue aggregates + time series |
| GET | /api/admin/revenue/breakdown | FR-A08 | Cost breakdown by agent |
| GET | /api/admin/agents/performance | FR-A09 | Per-agent metrics |
| GET | /api/admin/tasks | FR-A10 | Paginated task list with filters |
| GET | /api/admin/health | FR-A11 | Platform health metrics |

---

## 8. Traceability Matrix

| FR | Screen | API Endpoint | Entity |
|----|--------|-------------|--------|
| FR-A01 | S-A00 | GET /api/admin/stats | E-01, E-02, E-03 |
| FR-A02 | S-A01 | GET /api/admin/users, GET /api/admin/users/{id} | E-01 |
| FR-A03 | S-A01 | PUT /api/admin/users/{id} | E-01 |
| FR-A04 | S-A02 | GET /api/admin/subscriptions | E-02 |
| FR-A05 | S-A02 | PUT /api/admin/subscriptions/{id} | E-02 |
| FR-A06 | S-A03 | GET /api/admin/revenue | E-03 |
| FR-A07 | S-A03 | GET /api/admin/revenue | E-03 |
| FR-A08 | S-A03 | GET /api/admin/revenue/breakdown | E-03, E-04 |
| FR-A09 | S-A04 | GET /api/admin/agents/performance | E-03, E-04 |
| FR-A10 | S-A04 | GET /api/admin/tasks | E-03 |
| FR-A11 | S-A05 | GET /api/admin/health | E-03 |
| FR-A12 | All | All /api/admin/* | E-01 |

---

## Document Metadata
- **Version:** 1.0
- **Created:** 2026-03-15
- **Owner:** Product (Solo Founder)
- **Status:** Draft — pending GATE 2 validation
- **Lean Report:** plans/reports/lean-20260315-super-admin-page.md
