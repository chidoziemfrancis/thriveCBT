# ThriveCBT data contract

Status: draft for team sign-off (B1). Once signed off, B2 onwards builds against it. Changes after sign-off are made here first, in the same pull request as the code.

This says what the backend stores and which endpoints the mobile app calls. It's split the same way as the app: **student** and **researcher**, plus the few things both use. Field names here are the JSON the app sends and receives.

## 1. Rules for every endpoint

- Base path `/v1`. Students use `/v1/me/...`, researchers `/v1/researcher/...`, both use `/v1/auth/...`.
- Send `Authorization: Bearer <accessToken>` on everything except login, sign-up, invite accept and password reset.
- Success is plain JSON. Lists return `{ "items": [...], "nextCursor": "…" | null }`.
- Errors are always `{ "error": { "code", "message", "details?", "requestId" } }`. The app reacts to `code`, never to `message`.
- Times are ISO 8601 in UTC. Dates without a time (a planned day) are `YYYY-MM-DD`.
- IDs are UUID v7. Student records that sync (section 3.4) get their ID from the phone.
- A researcher can only reach students assigned to them. Asking for anyone else returns `404 NOT_FOUND`, so the API never confirms another student exists.
- Every route needs a login unless it's marked open (health, docs, and the `/v1/auth/...` routes). A logged-in user calling a route for another role gets `403 FORBIDDEN`.
- Rate limits per device address: 100 requests a minute overall; 5 a minute for sign-up, login and password reset; 20 a minute for refresh. Over the limit returns `429 RATE_LIMITED`.

Common error codes, possible on any endpoint: `VALIDATION_FAILED` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `PAYLOAD_TOO_LARGE` (413), `RATE_LIMITED` (429), `INTERNAL` (500), `SERVICE_UNAVAILABLE` (503).

## 2. Shared: login and accounts

| Method | Path                              | Who                         | Body                        | Returns                                   | Phase |
| ------ | --------------------------------- | --------------------------- | --------------------------- | ----------------------------------------- | ----- |
| POST   | `/v1/auth/register`               | Anyone (students only)      | `{ email, password }`       | `201 { user, accessToken, refreshToken }` | B2.1  |
| POST   | `/v1/auth/login`                  | Anyone                      | `{ email, password }`       | `{ user, accessToken, refreshToken }`     | B2.1  |
| POST   | `/v1/auth/refresh`                | Anyone with a refresh token | `{ refreshToken }`          | `{ accessToken, refreshToken }`           | B2.1  |
| POST   | `/v1/auth/logout`                 | Anyone with a refresh token | `{ refreshToken }`          | `204`                                     | B2.1  |
| GET    | `/v1/me`                          | Logged in                   |                             | `user`                                    | B2.1  |
| POST   | `/v1/auth/verify-email`           | Logged in                   | `{ code }`                  | `user`                                    | B2.3  |
| POST   | `/v1/auth/verify-email/resend`    | Logged in                   |                             | `204`                                     | B2.3  |
| POST   | `/v1/auth/password-reset/request` | Anyone                      | `{ email }`                 | `204`, even if the email is unknown       | B2.3  |
| POST   | `/v1/auth/password-reset/confirm` | Anyone                      | `{ email, code, password }` | `204`                                     | B2.3  |
| POST   | `/v1/auth/invites/accept`         | Invited researcher          | `{ token, password }`       | `{ user, accessToken, refreshToken }`     | B2.4  |
| POST   | `/v1/admin/researcher-invites`    | Study lead                  | `{ email, name }`           | `201 { id, email, name, expiresAt }`      | B2.4  |
| POST   | `/v1/me/push-tokens`              | Logged in                   | `{ token, platform }`       | `204`                                     | B6    |
| DELETE | `/v1/me/push-tokens/:token`       | Logged in                   |                             | `204`                                     | B6    |

`user` is `{ id, email, role: "student" | "researcher" | "lead", status: "active" | "suspended" | "withdrawn", createdAt }`. plus `emailVerified` (true once the email code is confirmed).

- Emails are trimmed and lowercased.
- Passwords: 8 to 128 characters, with at least one letter and one number (the same rule as the app).
- Access tokens last 15 minutes. Refresh tokens last 30 days, are stored only as a hash, and are replaced on every refresh. Reusing an old refresh token ends that whole login on every device. Logout ends the login the token belongs to.
- A wrong password and an unknown email give the same error and take the same time.
- Email verification and password reset use the 6-digit codes the app's screens expect. Codes are stored hashed, last 15 minutes and allow 5 tries; asking for a new code retires the old one.
- Sign-up emails a verification code. If the email can't be sent, sign-up still succeeds and the student can ask for a new code.
- A password reset logs out every device and also confirms the email.
- Researchers can't sign up. The study lead invites them by email; the email links to `thrivecbt://researcher/accept-invite?token=…`, valid for 7 days. A new invite to the same email retires the old one. Accepting creates a researcher account with a confirmed email and an invite code for students (for example `GRACE1`), then logs them in. The first lead account is made with `npm run lead:create -- <email>`.
- Emails are sent through Unosend. Resend returns `503 EMAIL_SEND_FAILED` if Unosend can't take the email; a reset request always returns `204`.
- The app PIN never leaves the phone.

Errors: `AUTH_EMAIL_TAKEN` (409), `AUTH_INVALID_CREDENTIALS` (401), `AUTH_TOKEN_INVALID` (401), `AUTH_TOKEN_EXPIRED` (401), `AUTH_TOKEN_REUSED` (401), `AUTH_ACCOUNT_SUSPENDED` (403), `AUTH_CODE_INVALID` (400), `AUTH_CODE_EXPIRED` (400), `AUTH_CODE_TOO_MANY_TRIES` (429), `AUTH_INVITE_INVALID` (400), `AUTH_INVITE_EXPIRED` (400), `AUTH_INVITE_EMAIL_TAKEN` (409), `EMAIL_SEND_FAILED` (503).

## 3. Student operations

### 3.1 Profile and settings

| Method | Path                 | Body                                                      | Returns       |
| ------ | -------------------- | --------------------------------------------------------- | ------------- |
| GET    | `/v1/me/profile`     |                                                           | `profile`     |
| PATCH  | `/v1/me/profile`     | any of `{ name, dateOfBirth, isUndergraduate, avatarId }` | `profile`     |
| GET    | `/v1/me/preferences` |                                                           | `preferences` |
| PATCH  | `/v1/me/preferences` | any of the preference fields                              | `preferences` |

- `profile`: `{ name, dateOfBirth, isUndergraduate, avatarId, studyWeek, joinedAt }`. `studyWeek` (1 to 8) is worked out on the server from `joinedAt`.
- `preferences`: `{ notifySessions, notifyMood, moodReminderTime, notifyMessages, notifyCheckIns }`. Vibration and the reminder-asked flag stay on the phone.

### 3.2 Study entry: consent, assessments, assignment

| Method | Path                | Body                                                  | Returns                                                                  |
| ------ | ------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| POST   | `/v1/me/consent`    | `{ version }`                                         | `{ version, agreedAt }`                                                  |
| GET    | `/v1/me/consent`    |                                                       | `{ version, agreedAt }` or `404`                                         |
| POST   | `/v1/me/phq9`       | `{ kind: "baseline" \| "final", answers: [0-3 × 9] }` | `{ id, kind, score, band, at }`                                          |
| GET    | `/v1/me/phq9`       |                                                       | `items` of the above                                                     |
| POST   | `/v1/me/epqr`       | `{ answers: [true/false × 100] }`                     | `{ id, at }`                                                             |
| GET    | `/v1/me/assignment` |                                                       | `{ researcher: { id, name, title, bio, photoUrl }, method, assignedAt }` |
| POST   | `/v1/me/assignment` | `{ inviteCode? }`                                     | same as GET                                                              |
| POST   | `/v1/me/withdraw`   | `{ reason?, confirm: "WITHDRAW" }`                    | `{ at }`                                                                 |

- The server scores the PHQ-9 and EPQ-R; the app doesn't send scores.
- EPQ-R scale scores are never returned to the student, matching the app.
- A `final` PHQ-9 is only accepted once Session 8 is complete, and each kind is accepted once.
- PHQ-9 question 9 above zero, or EPQ-R question 76 answered Yes, raises an urgent researcher alert in the same request. If raising the alert fails, the request fails.
- Assignment: an invite code goes to that researcher; otherwise random among researchers with space, at most 10 students each.

Errors: `CONSENT_REQUIRED` (403, on any `/v1/me/...` data call before consent), `PHQ9_ALREADY_SUBMITTED` (409), `PHQ9_FINAL_NOT_OPEN` (409), `EPQR_ALREADY_SUBMITTED` (409), `ASSIGNMENT_NO_RESEARCHER` (503, nobody has space), `ASSIGNMENT_INVITE_INVALID` (400), `WITHDRAW_CONFIRM_MISMATCH` (400).

### 3.3 Sessions

| Method | Path                         | Body                              | Returns              |
| ------ | ---------------------------- | --------------------------------- | -------------------- |
| GET    | `/v1/me/sessions`            |                                   | `items` of `session` |
| PUT    | `/v1/me/sessions/:sessionId` | `{ done, answers, completedAt? }` | `session`            |

- `session`: `{ sessionId (1-8), done: [moduleId], answers: { stepId: answer }, completedAt, updatedAt }`.
- An `answer` is a number, a list of numbers, a list of strings, true/false or text, exactly as the app saves it today.
- The phone sends the whole record for that session; the server keeps the newest by `updatedAt`.

Errors: `SESSION_NOT_FOUND` (404, outside 1 to 8).

### 3.4 Student tools (synced)

These work offline. The phone creates each item's `id`, saves locally first, then sends it. Every kind uses the same three routes:

| Method | Path                         | Returns                                                                                            |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| GET    | `/v1/me/<kind>?since=<time>` | `{ items, serverTime }`: everything changed after `since`, deleted items included with `deletedAt` |
| PUT    | `/v1/me/<kind>/:id`          | the saved item; creates or updates                                                                 |
| DELETE | `/v1/me/<kind>/:id`          | `204`; keeps a deleted marker so other devices learn about it                                      |

| `<kind>`             | Fields (besides `id`, `updatedAt`, `deletedAt`)                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `moods`              | `mood` (0-4), `note?`, `at`                                                                                                                   |
| `journal`            | `prompt?`, `text`, `mood?` (0-4), `sessionId?`, `at`, `editedAt?` — text is encrypted on the server                                           |
| `thought-records`    | `situation`, `thought`, `feeling` (list), `action?`, `traps` (list), `sessionId?`, `balanced?`, `beliefBefore?`, `beliefAfter?` (0-100), `at` |
| `planned-activities` | `date` (`YYYY-MM-DD`), `slot`, `label`, `predicted?` (0-10), `sessionId?`, `doneAt?`, `enjoy?`, `achieve?` (0-10)                             |
| `toolkit`            | `cardId` (one item per card the student keeps)                                                                                                |
| `tool-uses`          | `cardId`, `helped` (0, 1 or 2), `at`                                                                                                          |
| `stress-entries`     | `situation`, `level?` (0-100), `helped?`, `at`                                                                                                |
| `positive-entries`   | `kind` (`strength`, `win`, `kind`, `other`), `text`, `at`                                                                                     |
| `homework-ticks`     | `sessionId`, `date` (`YYYY-MM-DD`)                                                                                                            |

Single records, replaced whole:

| Method   | Path                          | Body                                                 | Notes                                         |
| -------- | ----------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| GET, PUT | `/v1/me/well-plan`            | `{ triggers, signs, actions, people, note?, goal? }` | `goal` is `{ area, goal, steps, date, done }` |
| GET, PUT | `/v1/me/emergency-contact`    | `{ name, relationship, phone }`                      | encrypted on the server                       |
| PUT      | `/v1/me/crisis-plan-progress` | `{ partsFilled }` (0-6)                              | the crisis plan itself stays on the phone     |

Sync rules:

1. The phone keeps the time of its last successful pull and sends it as `since`.
2. Changes made offline wait in a queue on the phone and are sent oldest first when back online, retrying with growing gaps.
3. `PUT` with the same `id` twice is safe; the second just updates.
4. If the phone and server both changed an item, the newer `updatedAt` wins.
5. After sending its queue, the phone pulls with `since`, then stores `serverTime` for next time.

Errors: `SYNC_STALE_UPDATE` (409, an older edit arrived after a newer one; the response holds the current item).

### 3.5 Check-ins, chat and video

| Method | Path                            | Body                                           | Returns                                                                             |
| ------ | ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| GET    | `/v1/me/check-ins`              |                                                | upcoming `items`: `{ id, startsAt, durationMin, note? }`                            |
| POST   | `/v1/me/check-ins/:id/feedback` | `{ rating (0-4 or null), note?, callSeconds }` | `204`                                                                               |
| GET    | `/v1/me/messages?before=<id>`   |                                                | `items`: `{ id, from: "student" \| "researcher", text, sentAt, readAt?, flagged? }` |
| POST   | `/v1/me/messages`               | `{ id, text }`                                 | the saved message                                                                   |
| POST   | `/v1/me/messages/read`          | `{ upTo: messageId }`                          | `204`                                                                               |
| POST   | `/v1/me/check-ins/:id/join`     |                                                | `{ roomUrl, token }` for the video call                                             |

- New messages and read receipts also arrive live over a WebSocket at `/v1/live` (B6).
- Risk words in a message never block it. The message is saved and sent, flagged, and the researcher gets an urgent alert.
- The video room opens 10 minutes before the start, as in the app today.

Errors: `CHECKIN_NOT_FOUND` (404), `CHECKIN_NOT_OPEN` (409), `FEEDBACK_ALREADY_SENT` (409), `MESSAGE_TOO_LONG` (400, over 2,000 characters).

### 3.6 My data

| Method | Path            | Returns                                                         |
| ------ | --------------- | --------------------------------------------------------------- |
| GET    | `/v1/me/export` | everything the server holds about the student, as one JSON file |

## 4. Researcher operations

All routes need the `researcher` role and only ever return the researcher's own students.

### 4.1 Profile, settings and availability

| Method | Path                      | Body                                     | Returns                                                           |
| ------ | ------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| GET    | `/v1/researcher/profile`  |                                          | `{ name, title, bio, photoUrl, capacity, accepting, inviteCode }` |
| PATCH  | `/v1/researcher/profile`  | any of `{ name, title, bio, accepting }` | same                                                              |
| GET    | `/v1/researcher/settings` |                                          | `{ hours, notify: { messages, calls } }`                          |
| PUT    | `/v1/researcher/settings` | same                                     | same                                                              |

- `hours`: one entry per weekday, `0` (Sunday) to `6`: `{ on, start, end }`, minutes from midnight. These are also the reply hours students see and the slots offered when booking.
- `capacity` is set by the study lead (10), not the researcher.

### 4.2 Caseload and student detail

| Method | Path                                            | Returns                                                                                       |
| ------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GET    | `/v1/researcher/students`                       | `items`: `{ id, name, studyWeek, lastActiveAt, moodThisWeek, openAlerts, completed }`         |
| GET    | `/v1/researcher/students/:id`                   | summary: profile, week, sessions done, last active, next call, PHQ-9 start and week 8, change |
| GET    | `/v1/researcher/students/:id/phq9`              | both PHQ-9s with every answer                                                                 |
| GET    | `/v1/researcher/students/:id/epqr`              | all 100 answers and the four scale scores                                                     |
| GET    | `/v1/researcher/students/:id/moods`             | mood entries                                                                                  |
| GET    | `/v1/researcher/students/:id/sessions`          | progress and answers per session                                                              |
| GET    | `/v1/researcher/students/:id/journal`           | entries (only if the study team allows it, see section 6)                                     |
| GET    | `/v1/researcher/students/:id/thought-records`   | thought records                                                                               |
| GET    | `/v1/researcher/students/:id/activities`        | planned activities and ratings                                                                |
| GET    | `/v1/researcher/students/:id/coping`            | toolkit, tool uses, stress entries, crisis-plan parts filled                                  |
| GET    | `/v1/researcher/students/:id/positive-entries`  | positive evidence                                                                             |
| GET    | `/v1/researcher/students/:id/well-plan`         | staying-well plan                                                                             |
| GET    | `/v1/researcher/students/:id/emergency-contact` | `{ name, relationship, phone }`; every call writes the audit log                              |

All read-only. The researcher never edits a student's own data.

### 4.3 Alerts

| Method | Path                                | Body              | Returns                                                                        |
| ------ | ----------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| GET    | `/v1/researcher/alerts?status=open` |                   | `items`: `{ id, kind, urgent, studentId, title, quote?, detail?, at, status }` |
| GET    | `/v1/researcher/alerts/:id`         |                   | the alert plus its `events`                                                    |
| POST   | `/v1/researcher/alerts/:id/events`  | `{ type, text? }` | the saved event                                                                |

- `kind`: `question9`, `epqrWish`, `riskWords`, `phq9Rise`, `severe`, `inactive`.
- Raised by the server: PHQ-9 question 9 above zero and EPQ-R question 76 Yes (on submit), risk words (on send), a final PHQ-9 at least 5 above the start, a score of 20 or more, and no activity for 5 days (daily job).
- `type`: `acknowledged`, `note`, `contactViewed`, `escalated`, `handled`. `status` is `new` with no events, `handled` once handled, otherwise `acknowledged`.
- Urgent alerts also send a push notification.

Errors: `ALERT_NOT_FOUND` (404), `ALERT_ALREADY_HANDLED` (409).

### 4.4 Check-ins and calls

| Method | Path                                 | Body                                                           | Returns                                                                         |
| ------ | ------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| GET    | `/v1/researcher/check-ins?from=&to=` |                                                                | `items`: `{ id, studentId, startsAt, durationMin, note?, weekly }`              |
| POST   | `/v1/researcher/check-ins`           | `{ studentId, startsAt, durationMin, note?, weekly }`          | the booking                                                                     |
| PATCH  | `/v1/researcher/check-ins/:id`       | `{ startsAt?, note? }`                                         | the booking                                                                     |
| DELETE | `/v1/researcher/check-ins/:id`       |                                                                | `204`                                                                           |
| POST   | `/v1/researcher/check-ins/:id/note`  | `{ attended, minutes, outcome?: "good" \| "concerns", note? }` | `204`; note text is encrypted                                                   |
| GET    | `/v1/researcher/students/:id/calls`  |                                                                | past calls with attendance, minutes, student feedback and the researcher's note |
| POST   | `/v1/researcher/check-ins/:id/join`  |                                                                | `{ roomUrl, token }`                                                            |

- `weekly: true` repeats the booking at the same time each week for the rest of the 8 weeks.
- A booking must fall inside the researcher's hours and not overlap another booking.
- Booking, moving or cancelling notifies the student.

Errors: `CHECKIN_OUTSIDE_HOURS` (409), `CHECKIN_OVERLAP` (409), `CHECKIN_IN_PAST` (400), `CHECKIN_NOT_FOUND` (404).

### 4.5 Chat

| Method | Path                                                           | Body                          | Returns                                                                                                   |
| ------ | -------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| GET    | `/v1/researcher/conversations`                                 |                               | `items`: `{ studentId, lastMessage, unread, flagged, followUp }`; flagged first, then unread, then newest |
| GET    | `/v1/researcher/conversations/:studentId/messages?before=<id>` |                               | messages, as on the student side                                                                          |
| POST   | `/v1/researcher/conversations/:studentId/messages`             | `{ id, text }`                | the saved message                                                                                         |
| POST   | `/v1/researcher/conversations/:studentId/read`                 | `{ upTo }`                    | `204`                                                                                                     |
| PUT    | `/v1/researcher/conversations/:studentId/follow-up`            | `{ followUp: true \| false }` | `204`                                                                                                     |

Quick replies are saved on the researcher's phone; the server doesn't need them.

## 5. Tables

One Prisma model per file under `prisma/schema/<module>/`. Every table has `id`, `createdAt` and `updatedAt` unless noted. Synced tables also have `deletedAt`.

| Phase | Model              | Main fields                                                                                               |
| ----- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| B0    | User               | email, passwordHash (B2.1), role, status, emailVerifiedAt (B2.3)                                          |
| B0    | AuditLog           | actorId, action, targetType, targetId, metadata, requestId (append-only)                                  |
| B2    | StudentProfile     | userId, joinedAt; name, dateOfBirth, isUndergraduate, avatarId, preferences (JSON) in B2.5                |
| B2    | ResearcherProfile  | userId, name, title, bio, capacity, accepting, inviteCode; photoUrl, hours and notify in B5               |
| B2    | RefreshToken       | userId, tokenHash, familyId, expiresAt, revokedAt                                                         |
| B2    | EmailCode          | userId, purpose (verify email or reset password), codeHash, expiresAt, attempts, usedAt                   |
| B2    | Invite             | email, name, tokenHash, invitedById, expiresAt, acceptedAt, revokedAt                                     |
| B3    | Consent            | studentId, version, agreedAt                                                                              |
| B3    | Phq9Result         | studentId, kind, answers, score, at                                                                       |
| B3    | EpqrResult         | studentId, answers, scores, at                                                                            |
| B3    | Assignment         | studentId, researcherId, method, assignedAt                                                               |
| B3    | Withdrawal         | studentId, reason, at                                                                                     |
| B3    | Alert              | studentId, researcherId, kind, urgent, title, quote, detail, sourceId, at                                 |
| B4    | SessionProgress    | studentId, sessionId, done, answers (JSON), completedAt                                                   |
| B4    | MoodEntry          | studentId, mood, note, at                                                                                 |
| B4    | JournalEntry       | studentId, prompt, text (encrypted), mood, sessionId, at, editedAt                                        |
| B4    | ThoughtRecord      | studentId, situation, thought, feeling, action, traps, sessionId, balanced, beliefBefore, beliefAfter, at |
| B4    | PlannedActivity    | studentId, date, slot, label, predicted, sessionId, doneAt, enjoy, achieve                                |
| B4    | ToolkitItem        | studentId, cardId                                                                                         |
| B4    | ToolUse            | studentId, cardId, helped, at                                                                             |
| B4    | StressEntry        | studentId, situation, level, helped, at                                                                   |
| B4    | PositiveEntry      | studentId, kind, text, at                                                                                 |
| B4    | WellPlan           | studentId, triggers, signs, actions, people, note, goal (JSON)                                            |
| B4    | HomeworkTick       | studentId, sessionId, date                                                                                |
| B4    | CrisisPlanProgress | studentId, partsFilled                                                                                    |
| B5    | AlertEvent         | alertId, actorId, type, text, at                                                                          |
| B5    | CheckIn            | studentId, researcherId, startsAt, durationMin, note, seriesId, cancelledAt                               |
| B5    | CallNote           | checkInId, attended, minutes, outcome, note (encrypted)                                                   |
| B5    | CallFeedback       | checkInId, rating, note, callSeconds                                                                      |
| B5    | EmergencyContact   | studentId, name, relationship, phone (all encrypted)                                                      |
| B6    | Message            | studentId, researcherId, from, text, sentAt, readAt, flagged                                              |
| B6    | Conversation       | studentId, researcherId, followUp, researcherReadAt                                                       |
| B6    | PushToken          | userId, token, platform                                                                                   |

## 6. Who sees what

For the study team to confirm before B4.

| Data                                                                             | Student                           | Their researcher       | Study lead                                        |
| -------------------------------------------------------------------------------- | --------------------------------- | ---------------------- | ------------------------------------------------- |
| PHQ-9 answers and score                                                          | Own band and score, as in the app | Yes                    | Yes                                               |
| EPQ-R answers and scale scores                                                   | No scores shown                   | Yes                    | Yes                                               |
| Session answers, moods, thought log, activities, coping, positive log, well plan | Yes                               | Yes, read-only         | Yes                                               |
| Journal                                                                          | Yes                               | **To confirm**         | Same as researcher                                |
| Crisis plan                                                                      | Yes, on the phone only            | Number of parts filled | No                                                |
| Emergency contact                                                                | Yes                               | Yes, every view logged | Yes, every view logged                            |
| Call notes                                                                       | No                                | Yes                    | Yes                                               |
| Chat                                                                             | Own conversation                  | Own students only      | Only if the study team decides chat is study data |

## 7. Phone storage to server

What each key the app stores today becomes. "Stays on phone" means it never goes to the server.

| Phone key                                          | Becomes                                                                | Phase |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ----- |
| `user_session`                                     | Login tokens (secure storage) and `GET /v1/me`                         | B2    |
| `pin_hash`, `pin_failed_attempts`                  | Stays on phone                                                         | —     |
| `mock_registered_accounts`, `mock_password_resets` | Removed; replaced by `/v1/auth/...`                                    | B2    |
| `onboarding`                                       | `PATCH /v1/me/profile`                                                 | B2    |
| `avatar_id`                                        | `PATCH /v1/me/profile` (`avatarId`)                                    | B2    |
| `preferences`                                      | `PATCH /v1/me/preferences`; vibration and the asked flag stay on phone | B2    |
| `consent`                                          | `/v1/me/consent`                                                       | B3    |
| `phq9_answers`, `phq9_mode`                        | Stay on phone while answering; then `POST /v1/me/phq9`                 | B3    |
| `phq9_scores`                                      | `GET /v1/me/phq9`                                                      | B3    |
| `epqr_answers`                                     | Stays on phone while answering; then `POST /v1/me/epqr`                | B3    |
| `epqr_result`                                      | Server only; the student never sees scores                             | B3    |
| `researcher_assignment`                            | `/v1/me/assignment`                                                    | B3    |
| `study_withdrawal`                                 | `POST /v1/me/withdraw`                                                 | B3    |
| `session_progress`                                 | `/v1/me/sessions`                                                      | B4    |
| `mood_log`                                         | `/v1/me/moods`                                                         | B4    |
| `journal`                                          | `/v1/me/journal`                                                       | B4    |
| `journal_draft`                                    | Stays on phone                                                         | —     |
| `thought_log`                                      | `/v1/me/thought-records`                                               | B4    |
| `planned_activities`                               | `/v1/me/planned-activities`                                            | B4    |
| `coping_toolkit`                                   | `/v1/me/toolkit`                                                       | B4    |
| `coping_uses`                                      | `/v1/me/tool-uses`                                                     | B4    |
| `stress_log`                                       | `/v1/me/stress-entries`                                                | B4    |
| `positive_log`                                     | `/v1/me/positive-entries`                                              | B4    |
| `wellbeing_plan`                                   | `/v1/me/well-plan`                                                     | B4    |
| `homework_ticks`                                   | `/v1/me/homework-ticks`                                                | B4    |
| `crisis_plan`                                      | Stays on phone; only `partsFilled` is sent                             | B4    |
| `emergency_contact`                                | `/v1/me/emergency-contact`                                             | B5    |
| `emergency_contact_card_dismissed`                 | Stays on phone                                                         | —     |
| `next_checkin`                                     | `GET /v1/me/check-ins`                                                 | B5    |
| `checkin_feedback`                                 | `POST /v1/me/check-ins/:id/feedback`                                   | B5    |
| `chat`                                             | `/v1/me/messages`                                                      | B6    |
| `notifications_last_seen`                          | Stays on phone                                                         | —     |
| `researcher_settings`                              | `/v1/researcher/profile` and `/v1/researcher/settings`                 | B5    |
| `researcher_schedule`                              | `/v1/researcher/check-ins`                                             | B5    |
| `researcher_call_log`                              | `/v1/researcher/check-ins/:id/note` and `.../calls`                    | B5    |
| `researcher_alerts`                                | `/v1/researcher/alerts`                                                | B5    |
| `researcher_chat`                                  | `/v1/researcher/conversations`                                         | B6    |
| Mock caseload (in code)                            | `/v1/researcher/students`                                              | B5    |

## 8. Open questions

| Question                                                    | Who        | Needed by |
| ----------------------------------------------------------- | ---------- | --------- |
| Can researchers read the journal?                           | Study team | B4        |
| Does the crisis plan stay on the phone only?                | Study team | B4        |
| Is chat study data (exported and analysed) or support only? | Study team | B6        |
| Minimum age, and who can join (undergraduates only)?        | Study team | B3        |
| Do control-group students use the app?                      | Study team | B3        |

## Sign-off

| Role       | Name | Date |
| ---------- | ---- | ---- |
| Backend    |      |      |
| Mobile app |      |      |
| Study team |      |      |
