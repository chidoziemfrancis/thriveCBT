# Backend to-do

Tick items as they're merged into `dev`. Each phase is one branch and one pull request. The full reasoning is in [backend-plan.md](backend-plan.md).

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Before we start

- [x] Confirm decisions: Zod, Docker for the local database, plain JSON responses
- [ ] Ask Dr Akande where study data must be stored (affects hosting in B7)
- [ ] Study team: can researchers read the journal? (needed before B4)
- [ ] Study team: does the crisis plan stay on the phone only? (needed before B4)
- [x] Install Docker Desktop on the development Mac

## B0 Foundation · `feat/backend-foundation`

- [x] `docs/` folder: plan, to-do, API docs guide, Postman guide, runbooks
- [x] Remove stray `eas.json` and `app.json` from the root; tidy `.gitignore`
- [x] Pin and install packages (Prisma 7.10.1, Zod, Swagger, Pino, throttler, Helmet, openapi-to-postmanv2)
- [x] `src/config/`: settings checked by Zod at startup
- [x] Prisma: `prisma.config.ts`, `prisma/schema/base.prisma`, one model per file
- [x] Models: `users/user.prisma`, `audit/audit-log.prisma`; first migration
- [x] `src/prisma/`: PrismaModule, PrismaService, database-error mapping
- [x] `src/shared/errors/`: AppError, error codes, error shape, global filter
- [x] `src/shared/pipes/`: Zod validation pipe
- [x] `src/shared/logging/`: request ID, log redaction
- [x] `src/shared/crypto/`: field encryption, token hashing
- [x] `src/modules/health/`: `GET /v1/health` with a database check
- [x] `main.ts`: `/v1` prefix, Helmet, CORS, body limit, rate limits, shutdown hooks
- [x] Remove the starter `app.controller.ts`, `app.service.ts` and their test
- [~] `docker-compose.yml`: PostgreSQL 17 (written; not yet run, Docker Desktop was stuck)
- [x] Swagger at `/v1/docs` and `/v1/docs-json`
- [x] `scripts/generate-openapi.mjs` → `docs/api/openapi.json`
- [x] `scripts/generate-postman.mjs` → `postman/thrivecbt.postman_collection.json`
- [x] Postman local environment; login script that saves tokens (ready for B2)
- [x] Seed: `prisma/seed/index.ts`, `users.seed.ts`
- [x] Unit tests: error filter, database-error mapping, encryption, config
- [x] `package.json` scripts: `db:*`, `prisma:validate`, `docs`, `docs:openapi`, `docs:postman`
- [x] CI: `.github/workflows/backend.yml` (validate, lint, format, typecheck, unit tests, docs up to date)
- [x] `AGENTS.md` and `CLAUDE.md`
- [x] README: setup in four commands
- [~] Runbook: local setup checked end to end on a clean clone (checked with local PostgreSQL; Docker path still to check)

## B1 Data contract · `feat/data-contract`

- [ ] `docs/api/` page per module: models, fields, endpoints, requests, responses, error codes
- [ ] Admin endpoints (`/v1/admin/...`) included for the web side
- [ ] Privacy table confirmed by the study team
- [ ] Sync rules written in full
- [ ] Map of the app's ~40 storage keys to endpoints
- [ ] Team sign-off

## B2 Accounts and login · `feat/accounts`

- [ ] Models: StudentProfile, ResearcherProfile, RefreshToken, PasswordReset, Invite
- [ ] `users` module: `students/`, `researchers/`
- [ ] `auth` module: `login/`, `password-reset/`, `invites/`
- [ ] `integrations/email/`
- [ ] Guards and decorators: auth, roles, `@CurrentUser()`, `@Roles()`, `@Public()`
- [ ] Strict rate limits on login and password reset
- [ ] Cookie login for the browser (for the web admin later)
- [ ] `scripts/create-lead.ts`
- [ ] Postman: login saves tokens; requests use `{{accessToken}}`
- [ ] App: `mobile/src/lib/api/` client, tokens in secure storage, automatic refresh
- [ ] App: sign-up, login, password reset switched over

## B3 Study core · `feat/study-core`

- [ ] Models: Consent, Phq9Result, EpqrResult, Assignment, Withdrawal, Alert
- [ ] `consent`, `assessments` (`phq9/`, `epqr/`), `assignment`, `withdrawal`, `alerts` modules
- [ ] `src/events/`: PHQ-9 and EPQ-R submitted
- [ ] Alerts on the server: question 9, EPQ-R 76, final rise of 5+, severe score
- [ ] Assignment: random, max 10 per researcher
- [ ] App: consent, both PHQ-9s, EPQ-R, assignment, withdrawal switched over

## B4 Sessions and student tools · `feat/student-sync`

- [ ] `src/shared/sync/` helpers
- [ ] Models: SessionProgress, SessionAnswer, MoodEntry, JournalEntry, ThoughtRecord, PlannedActivity, ToolkitItem, ToolUse, StressEntry, PositiveEntry, WellPlan, HomeworkTick
- [ ] Modules: `sessions`, `mood`, `journal`, `thoughts`, `activities`, `coping` (`toolkit/`, `stress-log/`), `beliefs`, `wellbeing`, `homework`
- [ ] Journal text encrypted
- [ ] App: `mobile/src/lib/sync/` engine
- [ ] App: each store switched over

## B5 Researcher side · `feat/researcher-api`

- [ ] Models: AlertEvent, CheckIn, CallNote, CallFeedback, Availability, EmergencyContact, ResearcherSettings
- [ ] Modules: `caseload`, `alerts` (`alerts/`, `alert-events/`), `checkins` (`bookings/`, `call-notes/`, `feedback/`, `availability/`), `audit`
- [ ] Emergency contact views written to the audit log
- [ ] Admin routes: `students/`, `overview/`
- [ ] App: researcher side switched from the mock caseload to the API

## B6 Live features · `feat/live`

- [ ] Models: Message, PushToken, NotificationPreference
- [ ] `chat` module with WebSocket gateway; risk words flagged on the server
- [ ] `notifications` module and `integrations/push/` (Expo)
- [ ] `src/jobs/`: daily reminders, inactivity alerts, token cleanup
- [ ] App: chat, push sign-up, reminders switched over

## B7 Launch · `feat/launch`

- [ ] `video` module and `integrations/video/` (Daily.co)
- [ ] `export` module (lead only, no names)
- [ ] Data deletion on withdrawal
- [ ] Admin routes: `settings/` (StudySetting model), `audit-log/`
- [ ] Hosting: staging and production, managed PostgreSQL, daily backups, secrets store, uptime alerts
- [ ] Runbooks: restore a backup, rotate a key, crisis alerts not arriving
- [ ] Security review
- [ ] App: turn off open-all-sessions testing; real helpline numbers and voice tracks

## Web side (parked)

- [ ] Decide what happens to the student pages in `pwa/`
- [ ] W0 web foundation · W1 landing page · W2 admin login and researcher invites · W3 students and overview · W4 exports, audit, settings
