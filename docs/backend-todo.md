# Backend to-do

Tick items as they're merged into `dev`. Each phase is one branch and one pull request. The full reasoning is in [backend-plan.md](backend-plan.md).

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

## What needs a backend

Every app feature that needs the server, split by who uses it. The phase in brackets is when it gets built.

### Student side

- [ ] Accounts: sign up, log in, log out, stay logged in, reset password (B2)
- [ ] Profile: name, email, avatar, notification settings (B2)
- [ ] Consent: save that the student agreed, with date and version (B3)
- [ ] Eligibility and onboarding answers (B3)
- [ ] PHQ-9 at sign-up and at week 8 (B3)
- [ ] EPQ-R: the 100 answers at sign-up (B3)
- [ ] Researcher assignment: which researcher the student is matched with (B3)
- [ ] Sessions: progress and answers for all 8 sessions (B4)
- [ ] Mood log: daily mood and notes (B4)
- [ ] Journal entries, encrypted (B4)
- [ ] Thought log: thought records and challenged thoughts (B4)
- [ ] My week: planned activities and their ratings (B4)
- [ ] Coping: toolkit, tool use, stress log (B4)
- [ ] Positive evidence log (B4)
- [ ] Staying-well plan and goal (B4)
- [ ] Homework: practice ticks per week (B4)
- [ ] Emergency contact, encrypted (B5)
- [ ] Crisis plan: only how many parts are filled; the plan stays on the phone (B4)
- [ ] Check-ins: see upcoming calls, give feedback after a call (B5)
- [ ] Chat with their researcher (B6)
- [ ] Push notifications: daily reminders, call reminders (B6)
- [ ] Video call: join the weekly check-in (B7)
- [ ] Withdraw from the study (B3)
- [ ] Download my data (B7)

### Researcher side

- [ ] Accounts: accept invite, log in, reset password (B2)
- [ ] Profile and settings: name, photo, reply hours (B5)
- [ ] Availability: times open for check-ins (B5)
- [ ] Caseload: list of their own students, with week, last active and mood (B5)
- [ ] Student profile: everything on the student side for one student, read-only (B5)
- [ ] PHQ-9 and EPQ-R answers, including start vs week 8 (B5)
- [ ] Alerts: PHQ-9 question 9, EPQ-R question 76, risk words in chat, severe or rising scores, inactive students (B3, B5, B6)
- [ ] Alert handling: acknowledge, add a note, mark handled (B5)
- [ ] Booking check-ins: create, reschedule, cancel, repeat weekly (B5)
- [ ] Call notes after each call, encrypted (B5)
- [ ] Call log: past calls, missed calls, student feedback (B5)
- [ ] Chat with their students: quick replies, follow-up flag (B6)
- [ ] Emergency contact view, with every view recorded (B5)
- [ ] Push notifications: new alerts, new messages, upcoming calls (B6)
- [ ] Video call: start the weekly check-in (B7)

### Shared by both

- [ ] Login and roles (B2)
- [ ] Push notifications (B6)
- [ ] Chat (B6)
- [ ] Video calls (B7)
- [ ] Alerts (B3, B5)
- [ ] Audit log (B5)

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

- [x] `docs/api/contract.md`: tables, student and researcher endpoints, requests, responses, error codes
- [ ] Admin endpoints (`/v1/admin/...`) for the web side (parked with the web)
- [~] Privacy table written; waiting on the study team to confirm
- [x] Sync rules written
- [x] Map of the app's storage keys to endpoints
- [ ] Team sign-off

## B2 Accounts and login

### B2.1 Sign-up and login · `feat/accounts`

- [x] Models: password on User, StudentProfile, RefreshToken; migration `auth_login`
- [x] `users` module, `accounts/` feature: account lookup, `GET /v1/me`
- [x] `auth` module, `login/` feature: register, login, refresh, logout
- [x] Login tokens: 15-minute access, 30-day refresh, hashed, replaced on every refresh, reuse ends the login
- [x] Password hashing (argon2id); same error and timing for wrong password and unknown email
- [x] Seed accounts get a test password
- [x] Unit tests: tokens, register and login, the guard, password hashing

### B2.2 Guards and roles

- [x] Login required on every route unless marked `@Public()`; health, docs and auth routes are public
- [x] Roles: `@Roles('student' | 'researcher' | 'lead')` and a roles guard (403 `FORBIDDEN`)
- [x] Strict rate limits: 5 a minute on register and login, 20 on refresh (password reset uses the same in B2.3)

### B2.3 Email codes

- [x] `integrations/email/`: Unosend, or printed to the log locally; production refuses the log
- [x] EmailCode model: 6-digit codes, hashed, 15 minutes, 5 tries; a new code retires the old one
- [x] Verify email after sign-up (code sent on sign-up), and resend
- [x] Password reset: request and confirm with a code; logs out every device
- [ ] Unosend: add the API key and verify the sending domain, then send one real test email
- [ ] Decide whether unverified students can use the app before confirming their email (B3)

### B2.4 Researcher invites

- [x] ResearcherProfile and Invite models; invite codes like `GRACE1`
- [x] `npm run lead:create -- <email>` makes the first lead; leads invite with `POST /v1/admin/researcher-invites` (Postman until the web admin)
- [x] Accept an invite and set a password; email link opens the app
- [ ] App: build the R2 accept-invite screen for `thrivecbt://researcher/accept-invite?token=…` (B2.6)

### B2.5 Student profile and settings

- [ ] Profile fields: name, date of birth, undergraduate, avatar
- [ ] Notification settings
- [ ] `GET/PATCH /v1/me/profile`, `GET/PATCH /v1/me/preferences`

### B2.6 App switch-over

- [ ] `mobile/src/lib/api/` client: tokens in secure storage, automatic refresh
- [ ] Sign-up, verify email, login, forgot and reset password, researcher invite and logout use the API
- [ ] Remove the mock accounts

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
- [ ] Trust the hosting proxy (`app.set('trust proxy', …)`) so rate limits count each device, not the proxy
- [ ] Runbooks: restore a backup, rotate a key, crisis alerts not arriving
- [ ] Security review
- [ ] App: turn off open-all-sessions testing; real helpline numbers and voice tracks

## Web side (parked)

- [ ] Decide what happens to the student pages in `pwa/`
- [ ] W0 web foundation · W1 landing page · W2 admin login and researcher invites · W3 students and overview · W4 exports, audit, settings
