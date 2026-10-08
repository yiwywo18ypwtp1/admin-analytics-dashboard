# Admin Analytics Dashboard

An analytics and user-management panel for a SaaS product, built with **Next.js 16 (App Router)**, React 19, TypeScript, Tailwind CSS and SQLite.

- **Dashboard**: revenue, active users, transactions and conversion for 7 / 30 / 90 days or a custom range, plus a revenue chart and recent transactions.
- **Users**: a table with search, status filter, sorting, pagination and page size. All of it lives in the URL.
- **User details**: profile, stats, recent transactions and an activity timeline.
- **Create / edit** users with validation (including unique email), and **optimistic delete** with rollback on failure.
- A typed **REST API** over the same data layer.

The goal was production-quality code without enterprise abstractions: every decision should be easy to explain.

---

## Getting started

Requires **Node 22+** (see `.nvmrc`). `better-sqlite3` is a native module built for Node 22, and older versions crash with exit code 139.

```bash
nvm use                      # Node 22 from .nvmrc
npm install
cp .env.example .env.local
npm run db:reset             # create data/app.db, run migrations, seed 200 users
npm run dev                  # http://localhost:3000
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run db:reset` | Delete the DB, apply migrations, seed 200 users |
| `npm run db:seed -- --users=100000` | Re-seed with 100k users (~30 s): the performance scenario |
| `npm run db:generate` | Create a migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run typecheck` / `npm run lint` | Type check (with generated route types) / ESLint |

### Simulating a slow or failing API

Set in `.env.local` and restart `npm run dev`:

| Variable | Effect |
|---|---|
| `MOCK_LATENCY_MS=1500` | Every data call waits 1.5 s, so skeletons are easy to see |
| `MOCK_FAILURE_RATE=1` | Every create / update / delete fails, to see the optimistic rollback |

---

## Project structure

```
src/
├── app/                      Routing only: pages, layouts, loading/error/not-found, Route Handlers
│   ├── dashboard/            Overview, users, user details, create/edit, transactions, settings
│   └── api/                  REST endpoints (thin adapters over data.ts)
├── features/                 Code grouped by domain
│   ├── users/                data.ts · actions.ts · schemas.ts · types.ts · users-url.ts · components/
│   ├── analytics/            data.ts · schemas.ts · types.ts · components/
│   └── transactions/         data.ts · types.ts · components/
├── db/                       DB infrastructure only: connection, schema, seed
├── components/               Shared UI: ui/ (Button, Card, Avatar…) and layout/ (Sidebar, Header)
└── lib/                      Small helpers: formatting, cn(), config, API error shape
drizzle/                      SQL migrations generated from src/db/schema.ts
```

Pages in `app/` stay thin: they read params, call a data function and render feature components. Everything about users lives in `features/users/`.

### Where logic lives

```
   Route Handler (JSON → HTTP status)      Server Action (FormData → form state)
                  \                            /
                   ▼                          ▼
     schemas.ts: zod, input format rules (shared by client and server)
                             │  validated, typed input
                             ▼
     data.ts: SQL, transactions, rules that need the DB (unique email, activity log)
```

- **`schemas.ts`**: required fields, email format, name length, URL params. Pure, also runs in the browser.
- **`data.ts`**: DB access only. Returns `{ ok: true, data } | { ok: false, error }` for *expected* failures (`EMAIL_TAKEN`, `NOT_FOUND`) and throws for unexpected ones.
- **Route Handlers / Server Actions**: two entry points into the same logic. Neither contains SQL.

Server Components read data by calling `data.ts` directly instead of fetching the app's own API (no extra HTTP hop). The UI mutates through **Server Actions**, which integrate with `useActionState` / `useOptimistic` and can revalidate the page in the same response. The `/api/*` Route Handlers are the public REST API for other clients.

---

## Server and Client Components

Server Components are the default. A component becomes a Client Component only when it needs state, event handlers, browser-only hooks or a browser-only library, and client components are kept as small "leaves".

| Component | Type | Why |
|---|---|---|
| Layouts, pages, `loading.tsx`, `not-found.tsx` | Server | Structure and data loading |
| `Sidebar` / `SidebarNav` | Server / **Client** | Only the active-link highlight needs `usePathname()` |
| `Header`, `ProjectName` | Server | Static |
| `UserMenu` | **Client** | Dropdown state, close on outside click / Escape |
| `PeriodSwitcher` | **Client** | Reads and changes the URL, draft dates for "Custom" |
| `KpiCards`, `TransactionsTable`, `UserStats`, `ActivityTimeline` | Server | Data + markup, zero JS |
| `RevenueChart` / `RevenueChartClient` | Server / **Client** | Only the SVG chart (recharts) runs in the browser |
| `UsersToolbar` | **Client** | Debounced search, select handlers |
| `UsersTable` | **Client** | `useOptimistic` for delete |
| `UsersPagination`, sort headers | Server / links | Plain `<Link>`s, work before hydration |
| `UserForm` | **Client** | `useActionState`, avatar preview, toast + navigation |
| `BackToUsersButton` | **Client** | `router.back()` |
| `error.tsx`, `global-error.tsx` | **Client** | React requires error boundaries to be client components |

---

## Key decisions

### The URL is the source of truth

The users table state (`?page=2&limit=25&search=john&status=active&sort=revenue&order=desc`) and the dashboard period (`?period=custom&from=…&to=…`) live in the URL, not in React state. That gives:

- refresh, shared links and the Back button all restore the exact view;
- **Users → User → Back** returns to the same page, search, filter and sort. With Cache Components, Next.js keeps recently visited pages mounted (React `<Activity>`), so the scroll position is restored too;
- invalid params never crash a page: every field in the zod schema has `.catch(default)`, so `?page=abc&limit=9999&sort=hack` simply shows page 1 with the defaults.

One function, `buildUsersHref()`, builds every table URL on both server and client. Any change other than the page resets to page 1. Search uses `router.replace` (no history entry per keystroke); filters, sorting and pages create history entries so Back undoes them.

### Loading without re-rendering the layout

Changing the period or the table query is a client navigation. Layouts don't re-render on search-param changes, so the sidebar and header stay mounted. The data sections are wrapped in `<Suspense key={query}>`: a new key makes React show the skeleton immediately instead of leaving stale data on screen with no feedback.

### Optimistic delete and rollback

```tsx
const [optimisticUsers, removeOptimistically] = useOptimistic(users, (list, id) => list.filter(u => u.id !== id));

startTransition(async () => {
  removeOptimistically(user.id);                 // the row disappears at once
  const result = await deleteUserAction(user.id);
  if (!result.ok) toast.error(result.message);
});                                              // transition ends → optimistic layer is dropped
```

No manual rollback code is needed. The optimistic layer only exists while the transition runs. On success the action has revalidated the page, so the new `users` prop no longer contains the user. On failure the prop is unchanged, so the row comes back by itself. `deleteUserAction` never throws (a throw inside the transition would replace the page with `error.tsx`).

### Caching and revalidation

| Data | Cached? | Why |
|---|---|---|
| Analytics (KPIs, chart) | **Yes**: `"use cache"` + `cacheLife("minutes")` + `cacheTag("analytics")` | Heaviest query (~0.3 s on 100k users) and runs on every Overview visit. A minute of staleness is fine for a dashboard. |
| Users, user details, transactions | No | An admin must see their own edits immediately, and these queries take milliseconds. |

After a mutation, Server Actions call `revalidatePath("/dashboard", "layout")`, so every dashboard page (table, user page, overview) shows fresh data, and the current page is re-rendered in the same response, with no full reload. Deleting a user also deletes their transactions, so `deleteUserAction` calls `updateTag("analytics")` to drop the cached numbers immediately (the REST `DELETE` uses `revalidateTag`, since `updateTag` only works in Server Actions).

Every uncached read in `data.ts` starts with `await connection()`. `better-sqlite3` is synchronous, so without it Next.js could run a query once during prerendering and serve that frozen result.

### Data model

SQLite via `better-sqlite3` + Drizzle ORM (row types are inferred from the schema). Money is stored in integer cents, dates as ISO strings. Email uniqueness is enforced by a `UNIQUE` constraint, not a check-then-insert (which would race). `revenue_cents` is denormalized on `users` so the table can sort by revenue without aggregating transactions.

---

## Performance (100,000 users)

Measured with `npm run db:seed -- --users=100000` (100k users, ~500k transactions, ~1M activity rows).

| What | Time |
|---|---|
| `GET /api/users`: any page, filter, search or sort | 4–75 ms |
| User details: each SQL query | ~0.1 ms |
| `GET /api/analytics`: first request / cached | ~0.3 s / ~10 ms |

- **Pagination on the server**: at most 100 rows reach the browser, so no list virtualization is needed.
- **Filtering and sorting in SQL** with indexes on every sortable column, plus an `id` tie-breaker so rows never jump between pages.
- **Covering indexes** for analytics (the queries read only the index, never the table).
- **Debounced search** (300 ms), stable React keys (`user.id`, never the index).
- **`next/image`** for avatars: fixed sizes (no layout shift), resized files, optimization limited to an allowlist of hosts.
- **No `useMemo` / `useCallback` / `React.memo`**: they were only to be added with a concrete reason. Re-rendering ≤ 100 simple rows after a delete takes well under a millisecond, so memoization would add complexity without a measurable gain.

---

## Edge cases: how to check them

| Case | How |
|---|---|
| Loading | `MOCK_LATENCY_MS=1500`, then open any page or change the period, search, sort or page |
| Error | `DATABASE_PATH=/tmp/empty.db npm run dev` (DB without tables), then open a user page |
| Empty | Create a user, then open their page ("No transactions yet") |
| No search results | `/dashboard/users?search=asdfghjkl` → "No users found." + "Clear filters" |
| Invalid URL params | `/dashboard/users?page=abc&limit=9999&sort=hack&status=weird` |
| Page out of range | `/dashboard/users?page=999` → "This page doesn't exist" |
| Unknown user | `/dashboard/users/999999` and `/dashboard/users/abc` → "User not found" |
| Duplicate email | Create a user with `daniel.anderson.1@example.com` → error under the field, input kept |
| Failed mutation | `MOCK_FAILURE_RATE=1`, then delete a user → row returns + toast; or save the form → error message |
| Slow API | `MOCK_LATENCY_MS=1500` |

---

## API

All responses are typed; errors share one shape: `{ error: { code, message, fieldErrors? } }`.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/users?page&limit&search&status&sort&order` | Paginated list; invalid params fall back to defaults |
| POST | `/api/users` | 201 · 400 validation · 409 email taken |
| GET | `/api/users/:id` | 404 for unknown or invalid ids |
| PATCH | `/api/users/:id` | Partial update · 400 · 404 · 409 |
| DELETE | `/api/users/:id` | 204 · 404 |
| GET | `/api/users/:id/activity` | 404 if the user doesn't exist (not an empty list) |
| GET | `/api/analytics?period=7d\|30d\|90d\|custom&from&to` | Returns the period actually used (invalid custom ranges fall back to 30d) |

---

## Out of scope

- **Authentication**: the current admin and project are constants (`src/lib/config.ts`).
- **Settings page**: placeholder. **Transactions page**: the 50 most recent transactions, without pagination (the task only requires the sidebar item).
- **Automated tests**, **dark mode**, **i18n**.
- Times are shown in UTC: Server Components don't know the viewer's time zone.
