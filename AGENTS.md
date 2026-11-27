# AGENTS.md

Rules for anyone, person or AI agent, working on the ThriveCBT backend. Read this before changing code. The reasoning behind these rules is in [docs/backend-plan.md](docs/backend-plan.md). What's left to build is in [docs/backend-todo.md](docs/backend-todo.md).

## What this is

ThriveCBT is an 8-week digital CBT programme for an RCT with Nigerian undergraduates. The backend serves the mobile app (students and researchers) and, later, a web admin for the study lead. It holds health data from young people, some of whom may be at risk. Treat every change with that in mind.

| Path       | What                                  | Rules                                                                       |
| ---------- | ------------------------------------- | --------------------------------------------------------------------------- |
| repo root  | NestJS 12 backend (this file)         | This file                                                                   |
| `mobile/`  | Expo app for students and researchers | Separate project; don't change it from backend work unless the task says so |
| `pwa/`     | Next.js web project, parked           | Has its own `AGENTS.md`; leave it alone for now                             |
| `docs/`    | Backend docs                          | Keep in step with the code                                                  |
| `postman/` | Postman collection and environments   | Generated; never edit by hand                                               |

## Commands

Run from the repo root.

| Command                           | Does                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| `npm run start:dev`               | Start the API with reloading (http://localhost:3000/v1)       |
| `npm run lint`                    | oxlint over `src/` and `scripts/`                             |
| `npm run format` / `format:check` | Prettier                                                      |
| `npm run typecheck`               | TypeScript, no output                                         |
| `npm run test`                    | Unit tests (Vitest)                                           |
| `npm run db:up` / `db:down`       | Start or stop local PostgreSQL (Docker)                       |
| `npm run db:migrate`              | Apply migrations, or create one after a schema change         |
| `npm run db:reset`                | Drop, migrate and seed the local database                     |
| `npm run db:seed`                 | Add test accounts and data                                    |
| `npm run prisma:validate`         | Check the Prisma schema                                       |
| `npm run docs`                    | Regenerate `docs/api/openapi.json` and the Postman collection |

Local database: either Docker (`npm run db:up`, port 5433) or a local PostgreSQL. Set `DATABASE_URL` in `.env`; see [docs/runbooks/local-setup.md](docs/runbooks/local-setup.md).

**Before every commit:** `npm run lint && npm run format:check && npm run typecheck && npm run test`. If you touched an endpoint, also `npm run docs`. If you touched the schema, also `npm run prisma:validate`.

## Folder layout

```
src/
├─ main.ts                 bootstrap only
├─ app.module.ts           imports modules, nothing else
├─ config/                 settings, validated by Zod at startup
├─ prisma/                 PrismaModule, PrismaService, database-error mapping
├─ shared/                 anything used by more than one feature or module; no study rules
│  ├─ errors/              AppError, the global filter, and every error code
│  │  └─ codes/            one file per module: health.errors.ts, phq9.errors.ts, …
│  ├─ pipes/  logging/  openapi/  guards/  decorators/
│  ├─ crypto/  sync/  utils/  types/  constants/
├─ integrations/           one wrapper per outside service: email/, push/, video/
├─ events/                 event names and their data
├─ jobs/                   scheduled tasks; they call module services
└─ modules/
   ├─ health/              one feature: role folders directly in the module
   │  ├─ health.module.ts
   │  ├─ controllers/  services/  repositories/  dto/  tests/
   └─ assessments/         two or more features: one folder per feature
      ├─ assessments.module.ts
      ├─ phq9/
      │  ├─ controllers/  services/  repositories/  dto/  tests/
      └─ epqr/
         ├─ controllers/  services/  repositories/  dto/  tests/
prisma/
├─ schema/
│  ├─ base.prisma          generator and database only
│  └─ <module>/<model>.prisma
├─ migrations/
└─ seed/
scripts/                   commands run by hand
```

### Every feature groups its files by role

```
controllers/<feature>.controller.ts    HTTP only: read the request, call the service, return
services/<feature>.service.ts          the rules
repositories/<feature>.repository.ts   the only file that touches Prisma
dto/<name>.dto.ts                      Zod schemas and their inferred types
tests/<feature>.service.spec.ts        unit tests for the service
```

A module file (`<module>.module.ts`) wires its features together and contains no logic. Error codes don't live in modules; they're in `src/shared/errors/codes/`.

## Structure rules

1. **Files are grouped by role** in `controllers/`, `services/`, `repositories/`, `dto/` and `tests/`. A module with one feature has these folders directly; a module with two or more features has one folder per feature, each with its own role folders. The module file only imports them.
2. **Anything used by more than one feature or module goes in `src/shared/`.** There are no `shared/` folders inside modules. Code used by one feature stays in that feature.
3. **Error handling is global.** `AppError`, the global filter and every error code live in `src/shared/errors/`; each module's codes are one file in `src/shared/errors/codes/`.
4. **`src/shared/` never imports from `src/modules/`,** and never holds study rules. "A PHQ-9 rise of 5 points" belongs in `assessments`, even though it's one line.
5. **A feature never imports another feature's repository.** It calls that feature's service, or listens for an event in `src/events/`.
6. **Modules talk through events where the link is a side effect.** Saving a PHQ-9 publishes `phq9.submitted`; `alerts` listens. `assessments` never imports `alerts`.
7. **Controllers never touch Prisma. Services never touch `Request` or `Response`.**
8. **Outside services only through `src/integrations/`.** No email, push or video SDK imported anywhere else.
9. **Create a folder when its first file arrives,** not before.

## Naming

- Files and folders: kebab-case, named after the feature: `phq9.service.ts`, `call-notes/`.
- Classes: PascalCase with the role: `Phq9Service`, `Phq9Repository`, `Phq9Controller`.
- Zod schemas: camelCase ending in `Schema` (`submitPhq9Schema`); inferred types drop it (`SubmitPhq9`).
- Error codes: UPPER_SNAKE, prefixed by feature when specific: `PHQ9_ALREADY_SUBMITTED`.
- Events: `<thing>.<past-tense>`: `phq9.submitted`, `message.flagged`.
- Routes: kebab-case nouns, plural for collections: `/v1/me/thought-records`.

## Prisma

- **One model per file,** in a folder named after the module: `prisma/schema/assessments/phq9-result.prisma`. The file name is the model name in kebab-case.
- `base.prisma` holds only the `generator` and `datasource` blocks.
- An enum lives in the file of the model that uses it. If two modules need it, put it with the model that owns the concept.
- Model names are singular PascalCase; table names are mapped to snake_case plural (`@@map("phq9_results")`); fields are camelCase mapped to snake_case (`@map("created_at")`).
- Every model has `id String @id @default(uuid(7)) @db.Uuid`, `createdAt` and `updatedAt`. Synced student data also has `deletedAt`, and its `id` is created by the phone, so no default.
- Add an index for every foreign key and every field used to filter or sort.
- Never edit a migration that has been merged. Make a new one.
- Prisma is pinned to 7.10.1. Upgrading is its own pull request.
- The generated client lives in `src/generated/prisma/` and is not committed.

## API conventions

- Every route starts with `/v1`. Students' own data under `/v1/me/...`, researchers under `/v1/researcher/...`, the study lead under `/v1/admin/...`.
- Successful responses are plain JSON. Lists return `{ items, nextCursor }`, paged by cursor.
- Times are ISO 8601 strings in UTC.
- Synced student data uses three routes per kind: `GET ?since=`, `PUT /:id` (create or update), `DELETE /:id`. Newest change wins.
- Every request body, query and param is validated by a Zod schema from the feature's `dto/` folder. No unvalidated input reaches a service.
- Every route needs a login by default. Mark open routes with `@Public()`, and limit a route to roles with `@Roles('researcher')`. A researcher may only read students assigned to them; check that in the service, not just the route.
- Login, sign-up and password-reset routes use `@Throttle(STRICT_RATE_LIMIT)` from `src/shared/constants/rate-limits.ts`.

## Errors

- Throw only `AppError` from our own code: `throw new AppError(PHQ9_ERRORS.ALREADY_SUBMITTED)`. Never throw raw strings, plain `Error`, or NestJS `HttpException` subclasses from a service.
- All error codes are global. Common ones (`NOT_FOUND`, `FORBIDDEN`, …) live in `src/shared/errors/error-codes.ts`; each module's own codes live in `src/shared/errors/codes/<module>.errors.ts`, each with a status and a user-safe message. No module keeps its own errors folder.
- The global filter turns everything into:
  ```json
  { "error": { "code": "…", "message": "…", "details": {}, "requestId": "…" } }
  ```
- Messages are safe to show a student: no stack traces, SQL, internal IDs or other people's data.
- Don't catch an error just to log it and rethrow. Catch only to add meaning or recover.
- The client switches on `code`, so never change an existing code's meaning. Add a new one.

## Privacy and security

This is health data. These rules have no exceptions.

- **Never log health data.** No answers, scores tied to a person, journal or message text, phone numbers, emails, names, tokens or passwords. The logger blanks known fields; don't log objects you haven't checked.
- **Encrypt sensitive fields** with `src/shared/crypto/field-cipher.ts`: journal text, call notes, emergency contacts. Do it in the repository so services see plain values.
- Passwords use argon2. Refresh and reset tokens are stored hashed, never in plain text.
- **The app PIN never leaves the phone. The crisis plan stays on the phone;** only the number of parts filled is sent.
- Write to the audit log for sensitive actions: viewing an emergency contact, exporting data, changing a role, handling an alert.
- Never commit secrets, real student data, or `.env`. Seed and test data are made up.
- Crisis alerts (PHQ-9 question 9, EPQ-R question 76, risk words) must never fail silently. If raising one fails, the request fails and the error is logged.

## Tests

- Every service has a `tests/<feature>.service.spec.ts` covering its rules and each error it can throw. Unit tests for `src/shared/`, `src/config/` and `src/prisma/` sit in a `tests/` folder beside the code they test.
- Unit tests never touch a real database or outside service; pass fakes into the class under test.
- A bug fix comes with a test that fails without it.

## API docs

- Swagger (`/v1/docs`) and the Postman collection are generated from the Zod schemas and controller decorators.
- Every controller has an `@ApiTags('<module>')`. Every endpoint documents its success response and every error code it can return.
- After changing an endpoint, run `npm run docs` and commit `docs/api/openapi.json` and `postman/thrivecbt.postman_collection.json` with the change. CI fails if they're stale.
- Never edit the Postman collection by hand. Environments in `postman/environments/` hold addresses and empty variables only.

## Comments

Avoid comments. Clear names, small functions and tests should explain the code. Most files need none.

- **Write a comment only to explain why,** when the reason isn't obvious from the code: a study rule ("5 points is the usual line for real change on the PHQ-9"), a workaround, or a privacy reason. Keep it to one short line.
- **Never explain what the code does.** If it needs explaining, rename or split it instead.
- **No comments on obvious things:** no `// get user`, no comment above every method, no section banners, no restating the type.
- **No doc comments (`/** */`) by default.** Add one only to a shared helper whose use isn't clear from its name and types. Swagger descriptions go in the decorators, not in comments.
- **No references to phases, plans or "for now"** in comments. They go stale; the to-do list tracks that.
- **No commented-out code.** Git keeps the history.
- **No `TODO` without a task in `docs/backend-todo.md`.**
- **No `eslint-disable` or `oxlint-disable`** to hide a problem. Fix it.

## Adding things

### A new module

1. Create `src/modules/<module>/` with `<module>.module.ts`.
2. One feature: add `controllers/`, `services/`, `repositories/`, `dto/` and `tests/` directly in the module. More: one folder per feature, each with those role folders.
3. Import the module in `app.module.ts`.
4. Add its models under `prisma/schema/<module>/`, one per file, then `npm run db:migrate`.
5. Add its error codes as `src/shared/errors/codes/<module>.errors.ts`, plus Zod schemas, unit tests and a seed file.
6. Run `npm run docs` and tick the item in `docs/backend-todo.md`.

### A new model

1. Create `prisma/schema/<module>/<model-name>.prisma` with the standard fields above.
2. `npm run prisma:validate`, then `npm run db:migrate` with a short, clear migration name.
3. Add seed data if it helps local work.

### A new outside service

1. Create `src/integrations/<service>/` with a module and a service that exposes only what we need.
2. Add a fake for tests; no test calls a real outside service.
3. Add any settings to `src/config/env.schema.ts` and `.env.example`.

## Git

- Branch from `dev`: `feat/<short-name>` (or `fix/`, `docs/`). Pull requests go into `dev`, never straight into `main`.
- Commit in logical steps, each passing all checks on its own.
- Commit messages: a short subject line, a line on why, grouped bullets of what changed, and the tests added.
- No AI co-author or "generated with" lines in commits or pull requests.
