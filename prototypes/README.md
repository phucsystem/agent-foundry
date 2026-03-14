# Agent Foundry - HTML Prototypes

Production-ready HTML/CSS/JS prototypes for the Agent Foundry MVP.

## How to View

Open any `.html` file directly in a browser, or serve locally:

```bash
cd prototypes
python -m http.server 8080
# Open http://localhost:8080/s01-agent-marketplace.html
```

## Screen Index

| Screen | File | Route | CJX Stage | FR Mapping |
|--------|------|-------|-----------|------------|
| S-01 Agent Marketplace | `s01-agent-marketplace.html` | `/agents` | discovery | REQ-4.1 |
| S-02 Agent Detail | `s02-agent-detail.html` | `/agents/{id}` | discovery | REQ-4.1 |
| S-03 Create Task | `s03-create-task.html` | `/tasks/create` | usage | REQ-4.3 |
| S-04 Task Board (Kanban) | `s04-task-monitor.html` | `/tasks` | usage | REQ-4.3 |
| S-05 Task Detail | `s05-task-results.html` | `/tasks/{id}` | usage | REQ-4.3 |
| S-06 Billing Dashboard | `s06-billing-dashboard.html` | `/billing` | retention | REQ-4.4 |
| S-07 Hired Agents (My Team) | `s07-hired-agents.html` | `/agents/hired` | usage | REQ-4.2 |
| S-08 Hired Agent Detail | `s08-hired-agent-detail.html` | `/agents/hired/{id}` | usage | REQ-4.2 |

## Shared Files

| File | Purpose |
|------|---------|
| `styles.css` | Design tokens (colors, spacing, typography, layout) from design-guidelines.md |
| `components.css` | Reusable component styles (agent cards, forms, charts, badges) |
| `interactions.js` | CJX stage animations, star ratings, budget slider, live feed simulation, dark theme toggle |

## Design System Source

All design tokens extracted from `docs/design-guidelines.md`:
- Colors: Blue primary (#3B82F6), Green success (#10B981), Amber warning (#F59E0B), Red error (#EF4444)
- Typography: System font stack, 6-level scale (12px-32px)
- Spacing: 4px grid (xs through 2xl)
- Components: Buttons, cards, badges, tables, forms per design-guidelines.md specs
- Dark mode: Full dark theme via `[data-theme="dark"]` CSS variables, persisted in localStorage

## CJX Stages

| Stage | Screens | Animation |
|-------|---------|-----------|
| Discovery | S-01, S-02 | fadeInUp 0.8s (bold entrance, trust signals) |
| Usage | S-03, S-04, S-05, S-07, S-08 | fadeIn 0.3s (clean, quick transitions) |
| Retention | S-06 | fadeIn 0.4s (help accessible, feedback channels) |

## Responsive Breakpoints

- Desktop: >1024px (4-column grids, sidebar visible)
- Tablet: 640-1024px (2-column grids, sidebar visible)
- Mobile: <640px (single column, sidebar hidden, sticky footer CTAs)
