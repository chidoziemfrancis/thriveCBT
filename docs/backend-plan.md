# ThriveCBT backend plan

Status: agreed plan, B0 not started. Last updated 26 November 2026.

## 1. Goal

Replace the phone-only storage and the mock caseload in the mobile app with a secure NestJS and PostgreSQL backend. It is built in eight phases, one branch and one pull request each. After every phase the backend runs, all checks pass, and the app switches over the screens that phase covers.

## 2. Stack

| Part           | Choice                                                      | Why                                                                                                                                   |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | NestJS 12, ES modules                                       | Already in the repo                                                                                                                   |
| Database       | PostgreSQL 17                                               | Reliable, available on every host                                                                                                     |
| Database tool  | Prisma 7.10.1, pinned                                       | Typed queries, migrations, one file per model. Prisma's npm `latest` tag points at an 8.0 release candidate, so the version is pinned |
| Validation     | Zod, through nestjs-zod                                     | Each check and its type written once; also drives Swagger                                                                             |
| Logging        | Pino, through nestjs-pino                                   | Structured logs with sensitive fields blanked                                                                                         |
| API docs       | Swagger (OpenAPI) and Postman, both generated from the code | See section 7                                                                                                                         |
| Passwords      | argon2                                                      | Current standard                                                                                                                      |
| Tests          | Vitest and Supertest                                        | Already in the repo                                                                                                                   |
| Local database | Docker Compose                                              | Same database as production, on your machine                                                                                          |

## 3. Folder layout

```
eCBT/                              repo root = backend
├─ AGENTS.md                       rules for people and agents
├─ docker-compose.yml              local PostgreSQL (dev and test databases)
├─ prisma.config.ts
├─ .env.example
├─ .github/workflows/backend.yml
├─ docs/                           this folder
├─ postman/                        Postman collection and environments (generated)
├─ scripts/                        commands run by hand (db reset, docs generation, export)
├─ prisma/
│  ├─ schema/
│  │  ├─ base.prisma               generator and database only
│  │  └─ <module>/<model>.prisma   one model per file
│  ├─ migrations/
│  └─ seed/                        test data, one file per module
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ config/                      settings, checked at startup
│  ├─ prisma/                      PrismaModule and PrismaService
│  ├─ shared/                      used across modules, no study rules
│  │  ├─ errors/  pipes/  interceptors/  guards/
│  │  ├─ decorators/  crypto/  sync/  utils/  types/  constants/
│  ├─ integrations/                email/, push/, video/: one wrapper per outside service
│  ├─ events/                      event names and their data
│  ├─ jobs/                        scheduled tasks
│  └─ modules/
│     ├─ health/                   one feature: flat
│     └─ assessments/              several features: one folder each
│        ├─ assessments.module.ts
│        ├─ shared/
│        ├─ phq9/
│        └─ epqr/
├─ test/
│  ├─ e2e/  factories/  utils/
├─ mobile/                         student and researcher app (separate project)
└─ pwa/                            web project, parked (see section 10)
```

### Every feature folder has the same shape

```
<feature>.controller.ts    HTTP only: read the request, call the service, return
<feature>.service.ts       the rules
<feature>.repository.ts    the only file that touches Prisma
dto/                       Zod schemas and their types
<feature>.errors.ts        this feature's error codes
<feature>.service.spec.ts
```

### Rules

1. A module with one feature stays flat. A module with two or more features gets one folder per feature, and the module file only imports them.
2. Shared code sits at the lowest level all its users can reach: the feature folder, then `modules/<module>/shared/`, then `src/shared/`. It moves up only when a second user needs it.
3. `src/shared/` never imports from `modules/`. Study rules stay in their module, even simple ones.
4. A feature never uses another feature's repository. It calls that feature's service, or listens for its event.
5. Controllers never touch Prisma. Services never touch HTTP request or response objects.
6. Files and folders are kebab-case and named after their feature (`phq9.service.ts`).
7. A folder is created when its first file arrives, not before.
8. Prisma schema folders mirror the module folders, one model per file, named after the model (`phq9-result.prisma`). An enum lives in the file of the model that uses it.

## 4. API conventions

- Every route starts with `/v1`. A student's own data is under `/v1/me/...`, researcher routes under `/v1/researcher/...`, study lead routes under `/v1/admin/...`.
- Successful responses are plain JSON. Lists return `{ items, nextCursor }`.
- Errors always return:
  ```json
  {
    "error": {
      "code": "CONSENT_REQUIRED",
      "message": "…",
      "details": {},
      "requestId": "…"
    }
  }
  ```
- IDs are UUID v7. For student data the phone creates the ID, so sending the same item twice never makes a duplicate.
- Times are ISO 8601 in UTC. Records carry `createdAt` and `updatedAt`; synced student data also carries `deletedAt` so deletions reach every device.
- Offline sync, per kind of data:
  - `GET /v1/me/<things>?since=<time>` returns what changed
  - `PUT /v1/me/<things>/:id` creates or updates
  - `DELETE /v1/me/<things>/:id` deletes
  - The newest change wins when both sides edited the same item.
- Login: a 15-minute access token and a 30-day refresh token, replaced on every use and stored hashed. The app PIN never leaves the phone.
- Roles: `student`, `researcher`, `lead`. A researcher only ever sees their own students.

## 5. Error handling

`AppError(code, status, message, details?)` is the only error our own code throws. Shared codes live in `src/shared/errors/error-codes.ts`; each feature lists its own in `<feature>.errors.ts`.

One global filter turns every failure into the error shape above:

| What failed                   | Response                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| `AppError`                    | Its own code and status                                     |
| Zod validation                | 400 `VALIDATION_FAILED`, each bad field listed in `details` |
| NestJS HTTP errors            | The matching code (`NOT_FOUND`, `UNAUTHENTICATED`, …)       |
| Prisma P2002 (duplicate)      | 409 `CONFLICT`                                              |
| Prisma P2025 (missing record) | 404 `NOT_FOUND`                                             |
| Database unreachable          | 503 `SERVICE_UNAVAILABLE`                                   |
| Anything else                 | 500 `INTERNAL`, generic message                             |

- Expected errors are logged as warnings, 500s as errors with the stack. A stack never reaches the client.
- Every request has an ID, from the `x-request-id` header or generated. It is returned in the header, in every log line and in every error.
- Logs blank out passwords, tokens, answers, free text, phone numbers and emails. Health data never appears in logs.

## 6. Security and privacy

- Field encryption (AES-256-GCM, `src/shared/crypto/`) for journal text, emergency contact details and call notes.
- argon2 for passwords; SHA-256 for refresh and reset tokens.
- Helmet headers, CORS allowlist, 1 MB request limit, rate limits (strict on login and password reset).
- An audit log for sensitive actions: viewing an emergency contact, exporting data, changing a role, handling an alert.

| Data                                | Student                            | Their researcher            | Lead                   |
| ----------------------------------- | ---------------------------------- | --------------------------- | ---------------------- |
| PHQ-9 and EPQ-R answers             | Own band only, as in the app today | Yes                         | Yes                    |
| Session answers, moods, thought log | Yes                                | Yes                         | Yes                    |
| Journal                             | Yes                                | Waiting on the study team   | Same as researcher     |
| Crisis plan                         | Yes, stays on the phone            | Number of parts filled only | No                     |
| Emergency contact                   | Yes                                | Yes, every view logged      | Yes, every view logged |

## 7. API documentation: Swagger and Postman

Both are generated from the code, so they can't drift from what the API really does.

### Swagger

- Served at `/v1/docs` (interactive page) and `/v1/docs-json` (the raw OpenAPI file).
- On in local and staging. Off in production.
- Built from the Zod schemas in each `dto/` folder through nestjs-zod, so request and response fields, types and limits come from the same code that validates them.
- Every controller is tagged with its module, so endpoints are grouped the same way as the folders.
- Every endpoint lists its success response and its error responses, all using the shared error shape, with an example of each.
- Login is set up once in the page (Bearer token), so protected endpoints can be tried directly.

### OpenAPI file

- `npm run docs:openapi` writes `docs/api/openapi.json` without starting a server or needing a database.
- The file is committed, so the API can be reviewed in pull requests and imported anywhere.

### Postman

- `npm run docs:postman` converts `openapi.json` into `postman/thrivecbt.postman_collection.json`.
- One Postman folder per module, matching the code.
- Collection-level auth uses `{{accessToken}}`. The login and refresh requests carry a small test script that saves the new tokens into the environment, so every other request works straight after logging in.
- Environments live in `postman/environments/`: `local` now, `staging` once it exists. They hold only addresses and empty variables, never real tokens or passwords.
- To use it: import the collection and an environment into Postman, run Login, then any request.

### Keeping them current

- `npm run docs` runs both generators.
- CI runs `npm run docs` and fails if `openapi.json` or the collection changed, meaning someone changed an endpoint without regenerating the docs.

## 8. Phases

| #   | Phase                      | The app switches over                         |
| --- | -------------------------- | --------------------------------------------- |
| B0  | Foundation                 | Nothing yet                                   |
| B1  | Data contract              | Nothing yet                                   |
| B2  | Accounts and login         | Sign-up, login, password reset                |
| B3  | Study core                 | Consent, PHQ-9, EPQ-R, assignment, withdrawal |
| B4  | Sessions and student tools | Every student screen                          |
| B5  | Researcher side            | The whole researcher side                     |
| B6  | Live features              | Chat, push notifications, reminders           |
| B7  | Launch                     | Video calls, go-live                          |

### B0 Foundation

1. Remove the stray `eas.json` and `app.json` from the root; check `.gitignore` covers `.env`, `dist`, coverage and generated Prisma code.
2. Install, at pinned versions: prisma and @prisma/client 7.10.1, @prisma/adapter-pg, pg, zod, nestjs-zod, @nestjs/swagger, nestjs-pino, pino-http, @nestjs/throttler, helmet, openapi-to-postmanv2.
3. `src/config/`: Zod checks for `NODE_ENV`, `PORT`, `DATABASE_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, `FIELD_ENCRYPTION_KEY`. The app stops at startup with a clear message if one is missing.
4. Prisma: `prisma.config.ts` pointing at `prisma/schema/`; `base.prisma`; first models `users/user.prisma` and `audit/audit-log.prisma`; first migration; `src/prisma/` with the service (pg adapter, connect at start, close on shutdown) and the database-error mapping.
5. `src/shared/errors/`: `app-error.ts`, `error-codes.ts`, `error-response.ts`, `all-exceptions.filter.ts`.
6. `src/shared/pipes/zod-validation.pipe.ts`; `src/shared/interceptors/` for request IDs and log redaction.
7. `src/shared/crypto/`: `field-cipher.ts`, `token-hash.ts`.
8. `src/modules/health/`: `GET /v1/health` returns `{ "status": "ok", "database": "ok" }`, or 503 when the database is down.
9. `main.ts`: `/v1` prefix, Helmet, CORS, 1 MB limit, rate limiting, Swagger, global filter and validation, clean shutdown.
10. `docker-compose.yml`: PostgreSQL 17 with `thrivecbt` and `thrivecbt_test`.
11. Swagger set up; `scripts/generate-openapi.ts` and `scripts/generate-postman.ts`; first `openapi.json` and collection (health only); local Postman environment.
12. Tests: unit tests for the error filter, database-error mapping, encryption and config; e2e for health; helpers `test/utils/test-app.ts`, `test/utils/reset-db.ts`, `test/factories/user.factory.ts`.
13. Scripts: `db:up`, `db:down`, `db:migrate`, `db:reset`, `db:seed`, `db:studio`, `prisma:validate`, `docs`, `docs:openapi`, `docs:postman`.
14. `.github/workflows/backend.yml`: install, Prisma validate, lint, typecheck, unit tests, docs up to date, e2e with a PostgreSQL service.
15. `AGENTS.md` and a one-line `CLAUDE.md` pointing to it; README setup in four commands.

Done when: `docker compose up` and `npm run start:dev` work; `/v1/health` reports the database; `/v1/docs` loads; the Postman collection imports and Health runs; a bad request returns the error shape; every check passes locally and in CI.

### B1 Data contract

- `docs/api/`: every model with its fields, every endpoint with request, response and error codes, grouped by module, including the `/v1/admin/...` routes the web side will need.
- The privacy table in section 6, confirmed by the study team.
- The sync rules in full.
- How each of the app's ~40 storage keys maps to an endpoint.

Done when the team signs it off.

### B2 Accounts and login

- Modules: `users` (`students/`, `researchers/`), `auth` (`login/`, `password-reset/`, `invites/`), `integrations/email/`.
- Models: StudentProfile, ResearcherProfile, RefreshToken, PasswordReset, Invite.
- Endpoints: register, login, refresh, logout, password reset request and confirm, researcher invites (lead only), accept invite, `GET` and `PATCH /v1/me`.
- Guards and decorators: auth, roles, `@CurrentUser()`, `@Roles()`, `@Public()`.
- App: API client in `mobile/src/lib/api/` with tokens in secure storage and automatic refresh.

### B3 Study core

- Modules: `consent`, `assessments` (`phq9/`, `epqr/`), `assignment`, `withdrawal`, `alerts`; `src/events/`.
- Models: Consent, Phq9Result (baseline or final), EpqrResult, Assignment, Withdrawal, Alert.
- Alerts raised on the server from events: PHQ-9 question 9 above zero, EPQ-R question 76 Yes, a final PHQ-9 rise of 5 or more, severe scores.
- Assignment: random, at most 10 students per researcher.

### B4 Sessions and student tools

- Modules: `sessions`, `mood`, `journal`, `thoughts`, `activities`, `coping` (`toolkit/`, `stress-log/`), `beliefs`, `wellbeing`, `homework`; `src/shared/sync/`.
- Models: SessionProgress, SessionAnswer, MoodEntry, JournalEntry (encrypted), ThoughtRecord, PlannedActivity, ToolkitItem, ToolUse, StressEntry, PositiveEntry, WellPlan, HomeworkTick.
- App: a sync engine in `mobile/src/lib/sync/`; each store switches over at one point.
- May be split into two pull requests.

### B5 Researcher side

- Modules: `caseload`, `alerts` (`alerts/`, `alert-events/`), `checkins` (`bookings/`, `call-notes/`, `feedback/`, `availability/`), `audit`; admin `students/` and `overview/` routes.
- Models: AlertEvent, CheckIn, CallNote (encrypted), CallFeedback, Availability, EmergencyContact (encrypted), ResearcherSettings.

### B6 Live features

- Modules: `chat` (WebSocket gateway; risk words flagged on the server), `notifications`, `integrations/push/` (Expo), `src/jobs/` (daily reminders, inactivity alerts, token cleanup).
- Models: Message, PushToken, NotificationPreference.

### B7 Launch

- Modules: `video` (Daily.co rooms and join tokens), `export` (lead only, no names), data deletion on withdrawal; admin `settings/` (helplines, campus contacts; model StudySetting) and `audit-log/` routes.
- Hosting, chosen once the data-location question is answered: staging and production, managed PostgreSQL with daily backups, secrets in the host's store, uptime alerts.
- Runbooks: restore a backup, rotate a key, crisis alerts not arriving.
- Before go-live: turn off the app's open-all-sessions testing setting, real helpline numbers, security review.

## 9. Testing

- Unit tests for every service and every error path.
- End-to-end tests for every endpoint against a real test database, reset between files.
- Factories so each test reads in a few lines.
- Every pull request runs everything in CI, and each commit is checked on its own before pushing.

## 10. Web side (parked)

The `pwa/` folder is left as it is for now. When it starts, it covers:

- A public landing page: what ThriveCBT is, how to join, study information, privacy, terms, contact, helplines on every page.
- An admin area for the study lead: invite and manage researchers, see students and reassign them, study overview and open crisis alerts, exports, audit log, helpline settings.
- Researchers accept invites in the mobile app; the web only sends them.

The backend plans for it now: the lead role, the `/v1/admin/...` routes in the data contract, and cookie-based login for the browser.

## 11. Decisions

| Decision                        | Choice        | Status                                   |
| ------------------------------- | ------------- | ---------------------------------------- |
| Validation                      | Zod           | Assumed, confirm                         |
| Local database                  | Docker        | Assumed, confirm                         |
| Success responses               | Plain JSON    | Assumed, confirm                         |
| Hosting                         | Decided in B7 | Waiting on where the data must be stored |
| Journal visible to researchers? |               | Study team, before B4                    |
| Crisis plan stays on the phone? | Yes, for now  | Study team, before B4                    |
