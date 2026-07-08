# Compliance Obligations Tracker

Full-stack take-home for Lazo: track a company's compliance obligations — what to file, when it is due, in what state, and with which supporting documentation.

- **Web (dashboard)**: Next.js App Router, Server Components + Server Actions, Tailwind, i18n (es/en).
- **API**: NestJS with the domain isolated from HTTP and persistence (ports & adapters), PostgreSQL via TypeORM.
- **Docs**: OpenAPI served by the API at `/docs` (Swagger UI) and `/openapi.json`.

Architecture and trade-off decisions are documented in [DECISIONS.md](DECISIONS.md).

## Live demo

- Web: https://lazo-compliance-tracker.vercel.app
- API: https://compliance-api-dt6t.onrender.com — OpenAPI docs at [/docs](https://compliance-api-dt6t.onrender.com/docs)

The API runs on Render's free tier: after 15 idle minutes it spins down and the first request takes ~30 seconds while it wakes up.

## Repository layout

```
apps/
├── web                    → Next.js dashboard (consumes the API server-side only)
└── services/compliance    → NestJS API
    └── src/modules/obligation
        ├── domain          → state machine, invariants, overdue, masking (pure TS)
        ├── application     → use cases + repository port
        └── infrastructure  → HTTP controller, TypeORM persistence + mapper
packages/
├── types                  → shared API contract types (@repo/types)
├── ui                     → shared UI primitives (@repo/ui)
├── typescript-config      → shared tsconfig
└── eslint-config          → shared lint rules
```

## Domain rules (enforced by the backend, never by the form)

State machine — the only way an obligation's status changes:

```
pending → in_progress → submitted → done
             ↑    ↓         ↓         ↓
             ← pending   in_progress  in_progress (reopen)
```

- **Invalid transitions are rejected with the list of allowed ones.** The API responds with `allowedTransitions` and `blockedTransitions` on every read; the frontend renders buttons from that — it contains no domain rules.
- **Document-gated submission**: when `requiresDocument` is true, the obligation cannot reach `submitted` without a `documentUrl`. Blocked transitions carry a machine-readable `reason`.
- **`overdue` is derived, never stored**: computed in the domain entity as a civil-date comparison (`dueDate < today in UTC`) for open statuses only (`pending`, `in_progress`).
- **`companyTaxId` is sensitive**: stored complete, returned only masked (`**-***6789`), never logged.
- **Audit trail**: every status change is recorded (from → to, when) in the same transaction as the change itself. The detail view shows the history.
- **Concurrency**: optimistic locking. Every mutation requires `expectedVersion`; a stale version gets `409 Conflict` and the UI asks the user to refresh.

## Running locally

Requirements: Node ≥ 20, pnpm 9 (`corepack enable`), Docker.

```bash
docker compose up -d        # PostgreSQL 16 on :5432
pnpm install
pnpm dev                    # web on :3000, API on :3002
```

Optional demo data (created through the public API, so it also builds audit history):

```bash
pnpm --filter compliance seed
```

- Web: http://localhost:3000
- API: http://localhost:3002 — Swagger UI at http://localhost:3002/docs

## Tests

```bash
pnpm --filter compliance test        # domain + application behavior (state machine, doc-gate, masking, error mapping)
pnpm --filter compliance test:e2e    # HTTP endpoints incl. version-conflict handling
pnpm check-types                     # strict TypeScript across the monorepo
```

## Deploying

The web app calls the API exclusively from the server (RSC + Server Actions), so the API needs no CORS setup and its URL is never exposed to the browser.

**API + database (Render):** [render.yaml](render.yaml) is a Render Blueprint that provisions the NestJS service and a free PostgreSQL instance wired together. In Render: *New → Blueprint → select this repo*. The free instance spins down when idle (first request takes ~30s) and the free database expires after 30 days — acceptable for a demo, documented trade-off.

**Web (Vercel):** import the repo with root directory `apps/web` and set:

```
COMPLIANCE_API_URL=https://<your-render-service>.onrender.com
```

Schema is created on boot (`TYPEORM_SYNCHRONIZE` defaults to true — see DECISIONS.md for why that is acceptable here and what production would use instead). Seed the deployed API with:

```bash
API_URL=https://<your-render-service>.onrender.com pnpm --filter compliance seed
```

## Deliberately left out

- **Real document upload** — the domain only asks "is there a document?"; `documentUrl` is a mock reference, so swapping in S3/presigned uploads changes an adapter, not the rules.
- **Migrations** — `synchronize` gated by env for this scope; production would use versioned TypeORM migrations.
- **Auth / multi-tenancy** — out of scope per the brief; the repository port is where tenant scoping would land.
- **Pagination** — the list endpoint is querystring-ready; the dataset here doesn't justify it.

## With more time

- A frontend behavior test for the transition flow (blocked submit button → attach document → submit).
- Structured logs (pino) with a redaction test proving the tax ID never reaches log output.
- CI running lint + tests for both layers.
- Replace `synchronize` with explicit migrations.
