# Admin Analytics Dashboard

Next.js 16 (App Router) + SQLite (better-sqlite3 + Drizzle ORM).

## Getting started

Requires Node 22+ (see `.nvmrc`).

```bash
nvm use
npm install
cp .env.example .env.local
npm run db:reset   # create data/app.db, apply migrations, seed 200 users
npm run dev
```

## Scripts

| Script | What it does |
|---|---|
| `npm run db:reset` | Delete the DB, apply migrations, seed |
| `npm run db:seed -- --users=100000` | Re-seed with 100k users (stress test) |
| `npm run db:generate` | Create a migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run typecheck` | Generate route types + `tsc` |

## Simulating a slow / failing API

Set in `.env.local` (see `.env.example`):

- `MOCK_LATENCY_MS=800` — every data call waits 800 ms
- `MOCK_FAILURE_RATE=0.3` — 30% of mutations throw (to test optimistic rollback)

## API

| Method | Path |
|---|---|
| GET | `/api/users?page&limit&search&status&sort&order` |
| POST | `/api/users` |
| GET / PATCH / DELETE | `/api/users/:id` |
| GET | `/api/users/:id/activity` |
| GET | `/api/analytics?period=7d\|30d\|90d\|custom&from&to` |
