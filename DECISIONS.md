# Engineering Decisions

What I picked, what I dropped, and why. The AI section at the end covers where it helped and where I had to correct it.

## Architecture

### One monorepo

Front and back live in the same Turborepo workspace. Main reason: they share one contract. `@repo/types` holds the request and response types, both sides import them, and if the contract changes the other side fails to compile instead of failing at runtime. Two repos would mean maintaining that shape by hand in two places.

Sharing the *contract* is not sharing the *domain*. The shape of an obligation is shared. The rules about it (which transitions are legal, when submit is blocked) live only in the backend. The frontend renders `allowedTransitions` and `blockedTransitions` straight from the API response. It never decides anything itself.

### Backend: NestJS

One language across the stack and Nest's DI container gives me the ports and adapters split without building it by hand.

The layout:

```
modules/obligation/
├── domain/            state machine, doc gate, overdue, masking (plain TS)
├── application/       use cases plus the repository port (interface)
└── infrastructure/    HTTP controller, TypeORM model, mapper, repository
```

The port is an interface (`IObligationRepository`) injected through a `Symbol` token. TS interfaces don't exist at runtime, so the token is what lets Nest wire it. The service depends on the port. TypeORM only shows up in infrastructure, so swapping Postgres for the in memory repo in the e2e tests is one provider line.

### TypeORM over Prisma

Prisma has nicer migrations. TypeORM fits Nest's DI better and the decorated persistence class makes the model, mapper and repository split explicit. With more time I'd revisit Prisma for the migration story alone.

`synchronize` is on for local dev and the demo deploy, gated by `TYPEORM_SYNCHRONIZE=false`. In production this would be versioned migrations: schema sync against a real database is how you lose a column.

## API contract

OpenAPI is generated from the same Zod schemas that validate requests. Validation, static types and docs come from one source. Swagger UI at `/docs`, raw document at `/openapi.json`. `@nestjs/swagger` only serves the UI; the document itself comes from Zod via `zod-to-openapi`.

| Method | Route | Notes |
|---|---|---|
| GET | `/obligation` | list, sorted by dueDate |
| GET | `/obligation/:id` | full detail: masked tax id, `overdue`, `statusHistory`, `allowedTransitions`, `blockedTransitions`, `version` |
| POST | `/obligation` | create. The server generates the id and status always starts `pending` |
| PATCH | `/obligation/:id` | edit details. Does NOT accept `status`. Requires `expectedVersion` |
| PATCH | `/obligation/:id/status` | the only way to change status. Requires `expectedVersion` |
| DELETE | `/obligation/:id` | |
| GET | `/health` | for the deploy health check |

Errors are typed:

```json
{
  "statusCode": 400,
  "status": "document_required",
  "message": "Attach a document before submitting this obligation.",
  "details": { "targetStatus": "submitted", "requiredField": "documentUrl" }
}
```

400 for malformed bodies (with Zod issues) and rule violations (`invalid_status_transition`, `document_required`), 404 when the obligation doesn't exist, 409 for stale versions (`version_conflict`). Clients switch on the `status` field, not on message text. That's also what lets the frontend translate errors.

Domain errors are named classes. The domain throws them, the application service maps them to HTTP. The domain never imports a Nest exception, so the rules stay portable.

## The state machine

```ts
pending:     ['in_progress'],
in_progress: ['submitted', 'pending'],
submitted:   ['done', 'in_progress'],
done:        ['in_progress'],
```

The tests iterate the full matrix. An invalid move throws a typed error that includes which moves *were* allowed.

Two things make it impossible to bypass:

1. the edit endpoint doesn't accept `status` at all. The schema omits it, so there is no second path around the machine.
2. the document gate lives inside the transition itself: `requiresDocument` and no `documentUrl` means `submitted` throws. It also works backwards: you can't edit a submitted obligation to strip its document out.

`documentUrl` is mock evidence on purpose. A real upload system (S3, checksums, retention) changes the infrastructure, not the rule.

## Where overdue lives

In the domain entity, computed on every read, never stored. A stored `overdue` column needs a job to flip it at midnight and can be stale between runs. Computing it in the frontend means trusting the user's browser clock and duplicating a rule that belongs to the backend.

The date handling matters more than it looks. `dueDate` is a civil date. A legal deadline is March 1st, not an instant. The naive check `new Date(dueDate) < now` parses the date as UTC midnight and compares it against an instant, so an obligation due *today* flips to overdue at different times of day depending on the server's timezone. I compare calendar dates instead: due date string against today's UTC date, lexicographic (ISO dates sort correctly as strings). Only `pending` and `in_progress` can be overdue. `submitted` and `done` never are.

`now` is a parameter with a default, so the boundary tests (due yesterday, due today, due tomorrow, per status) are deterministic.

## Concurrency

Optimistic locking. Every response carries a `version`; every mutation requires `expectedVersion`; the update runs as

```sql
UPDATE ... SET ..., version = version + 1
WHERE id = :id AND version = :expectedVersion
```

Zero rows affected means 409, with the current version in the payload so the client can refetch and retry. Nobody silently overwrites anybody.

Why not pessimistic locks: user think time happens outside the transaction. Holding row locks across "human reads the form, decides, clicks" blocks other users and complicates retries, and the loser still learns nothing. Conflicts are rare enough that rejecting the stale write is the cheaper design.

One detail: the status change revalidates the transition against the row *inside* the transaction, and the audit insert happens in that same transaction. Validating before it would validate stale state; auditing after commit could miss.

## Audit trail

`obligation_status_changes` is insert only: from, to, when. Written in the same transaction as the status change. No change without a record, no record without a change.

`obligations.status` answers "where is it now", the audit table answers "how did it get there". The row is still the source of truth and the history derives from changes, not the other way around. Event sourcing would give me the trail for free but drags in an event store, projections and replay for a problem that only asked for traceability.

## Sensitive data

`companyTaxId` is stored complete. The system may need the real identifier to file or reconcile, but it never leaves the API complete: read responses replace it with `maskedCompanyTaxId` at the response boundary, and nothing logs it. The response schema doesn't even have a field for the raw value, so leaking it would require adding code.

Request logging goes through pino with redaction paths for `companyTaxId` (top level, nested, request body). Nothing in the API logs obligation objects today, so redaction is the second net: if someone ever does, the field comes out as `[Redacted]` instead of the value. A test feeds an obligation through the same redaction config and asserts the real value never reaches the output. The health endpoint is excluded from request logs because Render pings it constantly and that is pure noise.

## Frontend

Server Components fetch, Server Actions mutate, `revalidatePath` refreshes. The API is called from the server only. Its URL and any future credentials never reach the browser, and there's no CORS to configure because there's no cross origin call.

State libraries I didn't use, and why:

- `useState` and `useContext` as the source of truth for obligations duplicates server data in the browser
- Redux is built for big client heavy apps with lots of independent local mutations. This dashboard is server backed with one source of truth
- TanStack Query is the strongest alternative, and the one I'd reach for if this needed optimistic inline editing or background refetching. For this scope it adds providers, cache invalidation rules and a CORS decision for things the app router already gives me.

Tradeoff accepted: the page refreshes after a mutation instead of patching in place. At this scale that's fine, and it keeps the backend response as the only truth on screen.

i18n is es/en with plain dictionaries and a `locale` param, no i18n library. 

## What I left out

- Real document upload.
- Migrations. `synchronize` is gated by env; the first production step is generating the initial migration and turning it off.
- Auth and multi tenancy. The repository port is where tenant scoping would slot in.
- Pagination. But the list endpoint takes querystring filters;

## AI usage

I used AI for: 

- scaffolding Nest modules
- Zod schemas with their OpenAPI metadata
- Tailwind components 
- test boilerplate
- generate swagger docs from OpenAPI
- generate models
- seed script
- health module
- error types from requirements
- guide through deployment on Render
- i18n locale text (en/es)
- generate docker .yaml file
- some server actions
- helper/utils for dashboard(parse, read)
- chore: pnpm config, build, deploy, repo git quirks

The part that needed correcting:

1. **overdue bug** The first version was `new Date(dueDate) < now && status !== 'done'`. Two real bugs in one line: `submitted` counted as overdue (the brief says overdue means past due AND not submitted/done), and it compared a calendar date parsed as UTC midnight against an instant, which makes the result depend on the server timezone. Rewrote it as a UTC calendar date comparison over open statuses only, plus boundary tests.

2. **repository stubs that lied** An early pass left `update(id)` and `updateStatus(id)` as methods that just called `findById` and returned the row. Compiled clean, looked finished, did nothing. Worse than missing, because it hides. Redesigned so transitions go through the domain entity and the repository does the conditional update with the version check.

3. **wiring tests instead of behavior tests** The generated spec asserted the controller exists. Deleted the idea, kept the file: now it's transition matrix, document gate, masking, error mapping and version conflicts.

4. **an import that would break at runtime** The service imported `Obligation` from `@repo/types` as a value import. The package exports raw `.ts` source, so if that import survived into the compiled output, `node dist/main.js` dies in production while everything works in dev. Switched to `import type` and checked the built output has zero runtime references to the package.

5. **modularize dashboard components** It was one big file for the dashboard. It needed refactoring and modularization, in order to work and be readable. Also some ui/ux light work.

6. **ui/ux polish** table with columns and actions, modals and toasts, search bar and filter buttons

The pattern: AI output fails quiet, not loud. It compiles, it demos, and the bug is in the semantics. Every correction came from reading the code

## Build notes

Short ones, kept because they cost me real time:

- The Nest scaffold ships with its own `.git`. Git staged the service as a submodule (mode 160000), meaning the outer repo would have held a pointer instead of the code. Removed the nested `.git` and added the service again as regular files.
- In a pnpm workspace, extending `@repo/typescript-config` requires declaring it as a devDependency in that package. Being present in the workspace isn't enough. Resolution is per `package.json`.
- `@repo/types` exports source (`./src/index.ts`), same as `@repo/ui`. No build step needed for internal packages; it would need `dist` and declaration files only if published.
- First Render deploy failed with corepack's `Cannot find matching keyid`. Node 22.12 bundles a corepack that still carries npm's old registry signing key. Reproduced the exact build in a Docker container, bumped `NODE_VERSION` to 22.16, green.
- The API logs a `pg` DeprecationWarning at boot ("Calling client.query() when the client is already executing a query"). Traced it with `--trace-deprecation`: it comes from TypeORM's `synchronize` schema builder, which introspects tables and enums with `Promise.all` on a single client. It goes away entirely on the production path where `synchronize` is off and migrations run instead. Only becomes a real problem on `pg@9`, and the project pins `^8`.
- Adding `NODE_ENV=production` to the Render env broke the next deploy with `nest: not found`. The variable also applies at build time, and `pnpm install` skips devDependencies when it sees it, so `@nestjs/cli` never got installed. Fix: `pnpm install --frozen-lockfile --prod=false` in the build command. Reproduced the exact build in Docker with `NODE_ENV=production` before pushing the fix.
