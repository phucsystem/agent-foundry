# Design Guidelines (UI/UX)

## Overview

Agent-foundry frontend (Next.js + Tailwind + Tamagui) prioritises clarity, efficiency, and trust. Users are hiring AI agents weekly — the experience should feel like collaborating with colleagues, not wrestling with software.

---

## Design Principles

### 1. Clarity Over Aesthetics
- Information hierarchy: most important first
- Clear action buttons (never ambiguous)
- Prominent status indicators (task state visible at a glance)
- Jargon-free language ("hire" not "instantiate")

### 2. Trust & Transparency
- Show costs before action ("This task will cost $2.50")
- Real-time progress (live agent reasoning)
- Agent success rates visible (past performance)
- Clear error messages ("Agent failed: invalid Python syntax" not "Error 500")

### 3. Efficiency
- Minimize clicks (common tasks in 2–3 clicks)
- Smart defaults (auto-select agent based on goal)
- Keyboard shortcuts for power users
- Bulk actions (hire 3 agents for 1 form)

### 4. Mobile-First (Phase 2+)
- Responsive layouts (Tamagui native + web)
- Touch-friendly buttons (min 44x44px)
- Simplified forms (fewer fields on mobile)

---

## Color Palette

### Light Mode
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Blue | #3B82F6 | CTAs, links, agent cards |
| **Success** | Green | #10B981 | Task completed, agent ready |
| **Warning** | Amber | #F59E0B | Approaching budget limit, long runtime |
| **Error** | Red | #EF4444 | Task failed, agent unavailable |
| **Neutral** | Slate | #64748B | Text, dividers, backgrounds |
| **Background** | White | #FFFFFF | Page background |
| **Surface** | Slate-50 | #F8FAFC | Card background |

### Dark Mode
- Same palette, adjusted opacity
- Backgrounds: Slate-900 (#0F172A)
- Surfaces: Slate-800 (#1E293B)
- Text: White with opacity adjustments

### Accessibility
- Contrast ratio: WCAG AA minimum (4.5:1 for text)
- Avoid color-only messaging ("Red means failed" → "Failed (Red icon)")

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
```

### Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **H1** | 32px | 700 | Page title |
| **H2** | 24px | 600 | Section heading |
| **H3** | 20px | 600 | Subsection |
| **Body** | 16px | 400 | Main text |
| **Small** | 14px | 400 | Secondary text, labels |
| **Tiny** | 12px | 400 | Captions, timestamps |

### Line Height
- Headings: 1.2x (compact)
- Body: 1.6x (readable)
- Form labels: 1.4x

---

## Spacing System

Consistent 4px grid:
```
xs: 4px    (gap-1)
sm: 8px    (gap-2)
md: 16px   (gap-4)
lg: 24px   (gap-6)
xl: 32px   (gap-8)
2xl: 48px  (gap-12)
```

### Layout Margins
- Page sides: 24px (mobile), 32px (desktop)
- Section gaps: 32–48px
- Component padding: 16–24px

---

## Component Patterns

### Buttons
```typescript
// Primary action (CTA)
<button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
  Hire Agent
</button>

// Secondary action
<button className="border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
  View Details
</button>

// Danger action (red)
<button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors">
  Delete Task
</button>
```

**Rules:**
- Primary: blue, full opacity
- Secondary: border, lower contrast
- Danger: red
- Min height: 44px (mobile touch target)
- Padding: 8–16px horizontal, 10–12px vertical
- Rounded: 8–12px (consistent with design system)

### Cards
```typescript
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Card content */}
</div>
```

**Rules:**
- White background (light), slate-800 (dark)
- Border: slate-200 (light), slate-700 (dark)
- Padding: 16–24px
- Shadow: subtle (shadow-sm) → slightly more on hover (shadow-md)
- Border radius: 8px

### Status Badge
```typescript
function StatusBadge({ status }: { status: 'pending' | 'running' | 'completed' | 'failed' }) {
  const colorMap = {
    pending: 'bg-slate-100 text-slate-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colorMap[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

### Form Fields
```typescript
<div className="flex flex-col gap-2">
  <label htmlFor="goal" className="text-sm font-semibold text-slate-900 dark:text-white">
    Task Goal
  </label>
  <input
    id="goal"
    type="text"
    className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
    placeholder="e.g., Write a React hook for authentication"
  />
  <span className="text-sm text-slate-600 dark:text-slate-400">Describe what you need the agent to do.</span>
</div>
```

**Rules:**
- Label: small, bold, above field
- Input: 2px focus ring (blue)
- Placeholder: muted color
- Helper text: below field (optional)
- Error state: border-red-500, error message in red

### Data Tables
```typescript
<table className="w-full border-collapse text-sm">
  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
    <tr>
      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Agent</th>
      <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
      <td className="py-3 px-4">Coder</td>
      <td className="py-3 px-4 text-right">$2.50</td>
    </tr>
  </tbody>
</table>
```

**Rules:**
- Header: gray background, bold text
- Rows: alternating hover states
- Borders: subtle, thin (1px)
- Padding: 12–16px
- Right-align numbers

---

## Pages & Flows

### 1. Agent Marketplace (`/agents`)

**Components:**
- Search + filter bar (top)
- Agent grid/list (4-column desktop, 2-column tablet, 1-column mobile)
- Agent cards (image, name, role, success rate, price, "Hire" button)

**Layout:**
```
[Header: Agent Foundry Marketplace]
[Search: _______________] [Filter ▼]
────────────────────────────────────
[Agent Card] [Agent Card] [Agent Card] [Agent Card]
[Agent Card] [Agent Card] [Agent Card] [Agent Card]
────────────────────────────────────
[Pagination: 1 2 3 ... 10]
```

**Copy:**
- Headline: "Hire Expert AI Agents" (instead of "Browse Agents")
- CTA: "Hire" (not "Select" or "Purchase")
- Filter options: Role, Cost Range, Success Rate

### 2. Agent Detail (`/agents/{id}`)

**Components:**
- Hero section (agent image, name, role, bio)
- Stats bar (success rate, avg cost, avg runtime, total tasks)
- About section (backstory, tools, specialization)
- Samples section (past outputs from public tasks)
- Reviews/ratings
- "Hire This Agent" button (sticky at bottom on mobile)

**Copy:**
- No jargon ("This agent uses Python & GitHub APIs")
- Real-world examples ("Fixed 150 bugs, wrote 2000+ lines of code")

### 3. Create Task (`/tasks/create`)

**Flow:**
1. Goal input (textarea, placeholder: "e.g., Write unit tests for login flow")
2. Context upload (drag-drop, PDF/markdown)
3. Agent selection (auto-selected based on goal, allow override)
4. Budget slider ($10–$500, preview: "This will cost ~$3.50")
5. Review & submit

**Copy:**
- "Define Your Task" (not "Task Input")
- "Upload Context Documents" (not "Attach Files")
- Cost estimate: "This task will likely cost $2.50 based on similar tasks"

### 4. Task Monitor (Real-Time Progress)

**Components:**
- Header: task goal, agent name, start time
- Progress bar (% complete visual)
- Live feed: agent reasoning, tool calls, errors
- Sidebar: cost accruing, tokens used, time elapsed
- Cancel button (if running)

**Live Feed Format:**
```
[10:30:23] Agent started analyzing code...
[10:30:45] Found 3 bugs in auth module
  → Tool: code_interpreter
  → Command: python analyze_code.py
[10:31:02] Writing test cases...
[10:31:30] ✓ Task completed in 67 seconds
```

**Copy:**
- Status: "Coder is analyzing your code..."
- Errors: "Tool call failed: GitHub API rate limit (try again in 2 mins)"
- Done: "Task completed! Cost: $2.50"

### 5. Task Results (`/tasks/{id}`)

**Components:**
- Header: task goal, agent, duration, cost
- Output section: markdown, code (with syntax highlight), PDFs
- Download options (PDF, markdown, JSON)
- Agent rating form (stars + optional comment)
- "Hire This Agent Again" button
- Related tasks (same agent, similar goal)

**Copy:**
- "Task Completed"
- "Download Results" (not "Export")
- Rating: "Did this agent meet your expectations?"

### 6. Billing Dashboard (`/billing`)

**Components:**
- Current tier card (tier name, renewal date, features)
- Usage this week (tasks, cost, projected total)
- Tier upgrade/downgrade selector
- Usage alerts (80%, 100% badges)
- Invoice history (table, download buttons)
- Cost breakdown (chart by agent)

**Copy:**
- Tier selector: "Upgrade to Full Squad for more agents" (not "Change Plan")
- Cost: "You've used $45 of your $100 weekly budget"

---

## Interaction Patterns

### Loading States
- Skeleton screens for data-heavy pages (agent list)
- Spinner for short operations (< 3s)
- Progress bar for long operations (task execution)

```typescript
// Skeleton
<div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />

// Spinner
<svg className="animate-spin h-5 w-5 text-blue-500">
  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
</svg>
```

### Error States
- Alert box (red border, red icon, clear message)
- Inline field errors (red text below input)
- Toast notifications for non-critical errors

```typescript
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
  <strong>Error:</strong> Agent execution failed. Try again or contact support.
</div>
```

### Empty States
- Illustration or icon
- Friendly message ("No tasks yet. Hire an agent to get started!")
- CTA button

### Modals/Dialogs
- Overlay: dark background (transparent black)
- Modal: white box, centered, shadow
- Close: X button (top-right), also Escape key
- Actions: buttons at bottom

---

## Responsive Design

### Breakpoints (Tailwind)
| Screen | Width | Use |
|--------|-------|-----|
| Mobile | <640px | Single column, large buttons |
| Tablet | 640–1024px | 2 columns, medium spacing |
| Desktop | >1024px | 3–4 columns, optimized layout |

### Mobile Optimizations
- Stack vertically (cards, forms)
- Larger touch targets (44x44px minimum)
- Simplified navigation (hamburger menu)
- Sticky headers (stay visible while scrolling)
- Bottom sheet for modals (easier to dismiss)

### Example: Agent Grid
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
</div>
```

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Form labels associated with inputs (htmlFor)
- [ ] Color not sole indicator (use icons + text)
- [ ] Focus visible (outline or ring on tab)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] ARIA roles where semantic HTML insufficient
- [ ] Contrast ratio >4.5:1 (text on background)
- [ ] Motion: respect prefers-reduced-motion
- [ ] Screen reader tested

### Example: Accessible Button
```typescript
<button
  onClick={handleClick}
  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  aria-label="Hire the Coder Agent for $50/week"
  type="button"
>
  Hire Agent
</button>
```

---

## Dark Mode

### Implementation
```typescript
// In parent component or Context
<div className={`${isDarkMode ? 'dark' : ''}`}>
  {/* All Tailwind dark: prefixes apply here */}
</div>
```

### Color Adjustments (Dark)
- Text: white/gray instead of dark gray/black
- Backgrounds: slate-900/800 instead of white
- Borders: slate-700 instead of slate-200
- Shadows: more subtle (dark reduces perceived depth)

### Testing
- Toggle dark mode in browser DevTools
- Verify contrast still meets WCAG AA
- Check images render properly (no dark overlay blending)

---

## Motion & Animation

### Transitions
- Subtle: button hover (50–100ms)
- Noticeable: modal open (150–200ms)
- Avoid rapid transitions (respect prefers-reduced-motion)

```css
transition: background-color 100ms ease-in-out;
transition: opacity 150ms ease;
```

### Micro-interactions
- Button press: subtle scale (98% → 100%)
- Hover: color shift + shadow increase
- Loading: smooth spinner animation
- Success: green checkmark animation

---

## Copywriting Guidelines

### Tone
- Professional but friendly (not corporate)
- Clear & direct (no marketing fluff)
- Action-oriented ("Hire" not "Consider")
- User-centric ("What do you need?" not "What can AI do?")

### Labels & Buttons
```
✓ "Hire Agent"       ✗ "Purchase Agent"
✓ "Upload Context"   ✗ "Provide Input Data"
✓ "View Results"     ✗ "Retrieve Output"
✓ "Agent Status"     ✗ "Execution Lifecycle"
```

### Error Messages
```
✓ "Agent ran out of time. Try a simpler task or increase the budget."
✗ "Process timeout exceeded threshold"

✓ "Your API key is invalid. Check settings or create a new one."
✗ "Authentication failed"
```

### Feedback Messages
```
✓ "Coder is writing the solution... (47 seconds elapsed, ~$1.20 so far)"
✗ "Agent 'coder-v1.0' executing task 'task-abc' with status 'executing'"
```

---

## Design System Assets

### Icons
- Source: Heroicons, Feather, or custom SVGs
- Size: 16px (small), 20px (medium), 24px (large)
- Color: inherit parent text color
- Stroke width: 1.5–2px

### Images
- Agent avatars: 64–128px (illustration or photo)
- Hero images: 1200x600px (optimized WebP)
- Lazy load below the fold

### Illustrations
- Consistent style (line-art or flat)
- Use for empty states, error pages
- Reinforce tone (friendly, professional)

---

## Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
export default {
  theme: {
    colors: {
      primary: '#3B82F6',      // blue-500
      success: '#10B981',      // green-500
      warning: '#F59E0B',      // amber-500
      error: '#EF4444',        // red-500
    },
    spacing: {
      'xs': '4px',
      'sm': '8px',
      'md': '16px',
      'lg': '24px',
      'xl': '32px',
      '2xl': '48px',
    },
  },
};
```

---

## Document Metadata
- **Version:** 1.0
- **Last Updated:** 2026-03-14
- **Owner:** Design Team
- **Status:** Active
