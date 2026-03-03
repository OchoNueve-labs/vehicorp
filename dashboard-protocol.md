# The $10K Dashboard Blueprint

## Protocolo para Construir Dashboards de Alto Valor con Claude Code

Dashboards don't sell because of code.
They sell because they translate chaos into decisions.
Claude Code is the acceleration layer — it builds the full Next.js app, connects to n8n webhooks, and deploys via GitHub → Vercel.
The value comes from clarity, positioning, and outcome mapping.

This protocol shows how to build and package dashboards that command $5K–$10K+ using Claude Code as the primary development environment.

---

## SECTION 1 — What Makes a $10K Dashboard

High-paying dashboards do one of three things:

1. Increase revenue visibility
2. Expose inefficiencies costing money
3. Give leadership instant decision clarity

They are not "pretty data screens."
They are **operational control panels**.

Before building anything, define:

- Who is this for?
- What decision does it help them make?
- What metric does it directly impact?
- What happens if they *don't* have it?

If the answer is vague, the dashboard is low value.

---

## SECTION 2 — The Positioning Framework

Never sell "a dashboard."

Sell:

- "Revenue Intelligence System"
- "Client Profitability Command Center"
- "Marketing Performance Control Panel"
- "Executive Snapshot Engine"

Attach it to **money, speed, or risk reduction**.

---

## SECTION 3 — The Claude Code Build Workflow

This is the exact flow.

### Step 1 — Define the Decision Layer

Before writing any code, clarify the metrics that matter. Use this prompt with Claude Code:

```
Act as a COO of a $5M–$20M company.
If you had a real-time dashboard for [industry], what 8–12 metrics would you need daily?

Group them by:
- Revenue
- Cost
- Growth
- Risk
- Efficiency

Explain why each matters.

Industry: [Insert niche]
```

This prevents building irrelevant metrics.

### Step 2 — Define Data Inputs & n8n Architecture

Map the backend before touching UI:

```
Based on these metrics, list:
- Required data sources (Supabase tables, external APIs)
- n8n workflow webhooks needed (one per data endpoint)
- Data cleaning/transformation in n8n Code nodes
- Derived metrics (calculated in n8n or frontend)

Metrics: [Paste list]
```

At this stage, Claude Code should:
1. **Search n8n templates** — `search_templates` for similar dashboard patterns
2. **Research nodes** — `search_nodes` + `get_node` for required integrations
3. **Build n8n workflows** — Create webhook endpoints that return JSON for each data group
4. **Validate** — `validate_workflow` before activating

### Step 3 — Build the Next.js Dashboard

Claude Code builds incrementally, layer by layer:

**Layer 1 — Project scaffold:**
```bash
npx create-next-app@latest dashboard-name --typescript --tailwind --app --src-dir
```

**Layer 2 — Layout & KPI cards:**
- Clear KPI cards at top (big numbers, trend indicators)
- Responsive grid with Tailwind CSS
- Modular component structure in `src/components/`

**Layer 3 — Charts & visualizations:**
- Trend charts below KPIs (use Recharts or Chart.js)
- Clean labeling, minimal color palette
- Dark + light mode support

**Layer 4 — Filters & interactivity:**
- Date range picker
- Segment/channel filters
- Loading states and error handling

**Layer 5 — API connection to n8n:**
- API routes in `app/api/` that proxy to n8n webhook URLs
- Environment variables for webhook URLs (`.env.local`)
- Proper error handling and response parsing

**Layer 6 — Polish & deploy:**
- Mobile responsive layout
- Performance optimization
- Push to GitHub → auto-deploy on Vercel

**Do not try to build everything in one prompt. Iterate layer by layer.**

### Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts or Chart.js |
| Backend | n8n Cloud (webhook endpoints) |
| Database | Supabase PostgreSQL |
| Deployment | Vercel (auto-deploy from GitHub) |
| Version Control | GitHub (via MCP) |

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── dashboard/route.ts    # Proxy to n8n dashboard webhook
│   │   ├── metrics/route.ts      # Proxy to n8n metrics webhook
│   │   └── export/route.ts       # Proxy to n8n export webhook
│   ├── components/
│   │   ├── KPICard.tsx
│   │   ├── TrendChart.tsx
│   │   ├── FilterBar.tsx
│   │   └── DataTable.tsx
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── api.ts                    # Fetch helpers for n8n webhooks
├── types/
│   └── dashboard.ts              # TypeScript interfaces
└── hooks/
    └── useDashboardData.ts       # Custom data fetching hook
```

### API Route Pattern

```typescript
// app/api/dashboard/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  const response = await fetch(process.env.N8N_DASHBOARD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return Response.json(await response.json());
}
```

---

## SECTION 4 — The "Looks Expensive" UI Formula

High-ticket dashboards share:

- Strong spacing (`p-6`, `gap-6` in Tailwind)
- Clear hierarchy (big KPI numbers → charts → tables)
- Minimal color palette (2-3 brand colors + grays)
- Big readable KPIs (text-3xl/4xl, font-bold)
- Micro-interactions (hover states, transitions)
- Clean chart labeling (no gridline clutter)
- No clutter (whitespace is premium)

Avoid:

- Overloaded graphs
- Rainbow color palettes
- 20+ KPIs on one screen
- Technical jargon
- Developer-style UI

**If it looks complex, executives won't use it.**

### Tailwind Design Tokens

```css
/* Use consistent spacing and colors */
KPI Card:     bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6
Chart Card:   bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6
Positive:     text-emerald-500
Negative:     text-red-500
Neutral:      text-gray-500
Big Number:   text-3xl font-bold tracking-tight
Label:        text-sm text-gray-500 uppercase tracking-wide
```

---

## SECTION 5 — 3 High-Ticket Dashboard Angles

Use these to sell $10K builds.

### 1. Client Profitability Dashboard

**For:** Agencies.

Includes:

- Revenue per client
- Cost per client
- Margin %
- Retention trend
- LTV projection
- Underperforming accounts

**Pain point solved:** Agencies often don't know which clients are quietly unprofitable.

**n8n backend:** Webhook pulls from CRM + accounting API → Code node calculates margins → Returns JSON.

### 2. Marketing Performance Intelligence

**For:** DTC or SaaS.

Includes:

- CAC
- ROAS
- Blended CAC
- Channel breakdown
- Conversion funnel drop-offs
- Cohort retention

**Pain point solved:** Channel fragmentation hides real performance.

**n8n backend:** Webhooks pull from ad platforms + Stripe → Merge & calculate → Returns JSON.

### 3. Founder Executive Snapshot

**For:** Small-to-mid companies.

Includes:

- Cash runway
- Revenue trend
- Burn rate
- Sales pipeline value
- Forecast vs actual
- Team productivity metrics

**Pain point solved:** Founders operate reactively without unified visibility.

**n8n backend:** Webhook aggregates from bank API + CRM + project tool → Code node builds snapshot → Returns JSON.

---

## SECTION 6 — Turning a Dashboard Into a $10K Offer

You are not selling code.

You are selling:

1. Audit
2. Architecture
3. Build
4. Training
5. Optimization

Package like this:

### Phase 1 — Data Audit

- Identify broken tracking
- Clean data sources
- Define KPI structure

### Phase 2 — System Build (Claude Code + n8n)

- n8n workflow creation (webhook endpoints, data transformations)
- Next.js dashboard build (UI, charts, filters)
- API integration (frontend ↔ n8n ↔ database)
- Validate with `validate_workflow` + local dev testing

### Phase 3 — Deployment & Implementation

- Deploy to Vercel via GitHub
- Configure production environment variables
- Onboarding session
- Documentation
- Refinement sprint

**Price anchor:** $7K–$15K depending on complexity.

---

## SECTION 7 — The Client Acquisition Angle

Do not pitch dashboards generically. Lead with insight.

Use this message:

> I noticed most [industry] teams track metrics in separate tools, which makes decision-making slower.
>
> If you had a single control panel showing:
> - [Metric 1]
> - [Metric 2]
> - [Metric 3]
>
> Would that help you make faster decisions weekly?
>
> If yes, I can map what that would look like for your business.

**Conversation first. Demo second. Proposal third.**

---

## SECTION 8 — Quality Control Checklist

Before delivering, run this checklist:

### Frontend QA

- [ ] All KPIs display real data from n8n webhooks
- [ ] Charts render correctly with various data ranges
- [ ] Filters work (date range, segments)
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] Dark/light mode works
- [ ] Loading states display properly
- [ ] Error states handle API failures gracefully
- [ ] No console errors

### n8n Backend QA

- [ ] All webhooks have `webhookId` (production URLs registered)
- [ ] `validate_workflow` passes with strict profile
- [ ] Test with `n8n_test_workflow` using realistic data
- [ ] Empty data returns valid JSON (COALESCE pattern)
- [ ] Error handling in workflow returns proper HTTP status codes

### Deployment QA

- [ ] Environment variables set in Vercel
- [ ] Production webhook URLs (not test URLs) configured
- [ ] GitHub → Vercel auto-deploy working
- [ ] HTTPS working correctly

### CFO-Style Review

Before shipping, critically evaluate:

- Missing critical KPIs?
- Confusing visualizations?
- Redundant metrics?
- Decision gaps?
- Scalability issues?

**Fix before shipping.**

---

## SECTION 9 — Avoid These Mistakes

- Overbuilding features clients didn't ask for
- Connecting too many data sources initially
- Ignoring mobile responsiveness
- Skipping documentation
- Selling design instead of outcomes
- Using n8n test webhook URLs in production
- Forgetting `webhookId` on webhook nodes
- Not validating workflows before activation
- Editing production n8n workflows directly (always copy first)

**Keep it focused. Keep it strategic.**

---

## SECTION 10 — The Build Execution Plan

| Phase | Tasks | Claude Code Actions |
|-------|-------|---------------------|
| 1. Requirements | Define metrics, data sources, user persona | Conversation + research |
| 2. n8n Backend | Build webhook endpoints, data transformations | `search_templates` → `n8n_create_workflow` → `validate_workflow` |
| 3. Scaffold | Create Next.js project, install dependencies | `npx create-next-app`, npm install |
| 4. Layout | KPI cards, grid layout, navigation | Write components with Tailwind |
| 5. Charts | Trend lines, bar charts, pie charts | Integrate Recharts/Chart.js |
| 6. API Layer | Connect frontend to n8n webhooks | API routes + fetch helpers |
| 7. Filters | Date range, segment filters, search | Interactive state management |
| 8. Polish | Animations, dark mode, mobile fixes | Tailwind refinements |
| 9. QA | Test all flows, validate n8n, check responsive | Checklist from Section 8 |
| 10. Deploy | Push to GitHub, configure Vercel | `git push` → auto-deploy |

---

## Final Principle

The tool trend doesn't matter long term. **Clarity does.**

If your dashboard:

- Makes money visible
- Exposes risk early
- Reduces decision friction

It has enterprise value.

Claude Code + n8n is the engine. **You are selling intelligence.**
