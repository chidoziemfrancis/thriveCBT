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

| Method | Path                              | Who                         | Body                        | Returns                                                  | Phase |
| ------ | --------------------------------- | --------------------------- | --------------------------- | -------------------------------------------------------- | ----- |
| POST   | `/v1/auth/check-email`            | Anyone                      | `{ email }`                 | `{ exists }`: log in if true, create a password if false | B2    |
| POST   | `/v1/auth/register`               | Anyone (students only)      | `{ email, password }`       | `201 { user, accessToken, refreshToken }`                | B2.1  |
| POST   | `/v1/auth/login`                  | Anyone                      | `{ email, password }`       | `{ user, accessToken, refreshToken }`                    | B2.1  |
| POST   | `/v1/auth/refresh`                | Anyone with a refresh token | `{ refreshToken }`          | `{ accessToken, refreshToken }`                          | B2.1  |
| POST   | `/v1/auth/logout`                 | Anyone with a refresh token | `{ refreshToken }`          | `204`                                                    | B2.1  |
| GET    | `/v1/me`                          | Logged in                   |                             | `user`                                                   | B2.1  |
| POST   | `/v1/auth/verify-email`           | Logged in                   | `{ code }`                  | `user`                                                   | B2.3  |
| POST   | `/v1/auth/verify-email/resend`    | Logged in                   |                             | `204`                                                    | B2.3  |
| POST   | `/v1/auth/password-reset/request` | Anyone                      | `{ email }`                 | `204`, even if the email is unknown                      | B2.3  |
| POST   | `/v1/auth/password-reset/confirm` | Anyone                      | `{ email, code, password }` | `204`                                                    | B2.3  |
| POST   | `/v1/auth/invites/accept`         | Invited researcher          | `{ token, password }`       | `{ user, accessToken, refreshToken }`                    | B2.4  |
| POST   | `/v1/admin/researcher-invites`    | Study lead                  | `{ email, name }`           | `201 { id, email, name, expiresAt }`                     | B2.4  |
| POST   | `/v1/me/push-tokens`              | Logged in                   | `{ token, platform }`       | `204`                                                    | B6    |
| DELETE | `/v1/me/push-tokens/:token`       | Logged in                   |                             | `204`                                                    | B6    |

`user` is `{ id, email, role: "student" | "researcher" | "lead", status: "active" | "suspended" | "withdrawn", createdAt }`. plus `emailVerified` (true once the email code is confirmed).

- Emails are trimmed and lowercased.
- `check-email` exists because the app asks for the email first. Sign-up already reveals a taken email, so it reveals nothing new; it uses the strict rate limit.
- Passwords: 8 to 128 characters, with at least one letter and one number (the same rule as the app).
- Access tokens last 15 minutes. Refresh tokens last 30 days, are stored only as a hash, and are replaced on every refresh. Reusing an old refresh token ends that whole login on every device. Logout ends the login the token belongs to.
- A wrong password and an unknown email give the same error and take the same time.
- Email verification and password reset use the 6-digit codes the app's screens expect. Codes are stored hashed, last 15 minutes and allow 5 tries; asking for a new code retires the old one.
- Sign-up emails a verification code. If the email can't be sent, sign-up still succeeds and the student can ask for a new code.
- A password reset logs out every device and also confirms the email.
- Researchers can't sign up. The study lead invites them by email; the email links to `thrivecbt://researcher/accept-invite?token=…`, valid for 7 days. A new invite to the same email retires the old one. Accepting creates a researcher account with a confirmed email and an invite code for students (for example `GRACE1`), then logs them in. The first lead account is made with `npm run lead:create -- <email>`.
- Emails are sent through Unosend. Resend returns `503 EMAIL_SEND_FAILED` if Unosend can't take the email; a reset request always returns `204`.
- The app PIN never leaves the phone.

Errors: `AUTH_EMAIL_TAKEN` (409), `AUTH_INVALID_CREDENTIALS` (401), `AUTH_TOKEN_INVALID` (401), `AUTH_TOKEN_EXPIRED` (401), `AUTH_TOKEN_REUSED` (401), `AUTH_ACCOUNT_SUSPENDED` (403), `AUTH_ACCOUNT_WITHDRAWN` (403, login and refresh after withdrawing), `AUTH_CODE_INVALID` (400), `AUTH_CODE_EXPIRED` (400), `AUTH_CODE_TOO_MANY_TRIES` (429), `AUTH_INVITE_INVALID` (400), `AUTH_INVITE_EXPIRED` (400), `AUTH_INVITE_EMAIL_TAKEN` (409), `EMAIL_SEND_FAILED` (503).

## 3. Student operations

### 3.1 Profile and settings

| Method | Path                 | Body                                                      | Returns       |
| ------ | -------------------- | --------------------------------------------------------- | ------------- |
| GET    | `/v1/me/profile`     |                                                           | `profile`     |
| PATCH  | `/v1/me/profile`     | any of `{ name, dateOfBirth, isUndergraduate, avatarId }` | `profile`     |
| GET    | `/v1/me/preferences` |                                                           | `preferences` |
| PATCH  | `/v1/me/preferences` | any of the preference fields                              | `preferences` |

- Student accounts only; anyone else gets `403 FORBIDDEN`.
- `profile`: `{ name, dateOfBirth, isUndergraduate, avatarId, studyWeek, joinedAt, startedAt }`. Empty fields are `null`.
  - `name`: 1 to 60 characters, trimmed.
  - `dateOfBirth`: `YYYY-MM-DD`, a real date in the past.
  - `avatarId`: one of the app's avatars, `avatar-01` to `avatar-08`.
  - `joinedAt` is the sign-up date; `startedAt` is the day the student first consented, which is when the study starts (agreeing to a newer version later doesn't restart it). `null` before consent.
  - `studyWeek` (1 to 8) is worked out on the server from `startedAt`, or from `joinedAt` before consent.
- `preferences`: `{ notifySessions, notifyMood, moodReminderTime, notifyMessages, notifyCheckIns }`. All notifications start on; `moodReminderTime` is `08:00`, `12:00`, `18:00` (default) or `21:00`. Vibration and the reminder-asked flag stay on the phone.
- `PATCH` takes any of the fields and refuses an empty body.

### 3.1b Onboarding status

| Method | Path                | Returns                                                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------- |
| GET    | `/v1/me/onboarding` | `{ nextStep, emailVerified, consented, profileComplete, isUndergraduate, phq9Done, epqrDone, matched }` |

- `nextStep` follows the app's screens: `verify-email`, `consent`, `profile` (name and date of birth), `eligibility`, `not-eligible`, `phq9` (the baseline), `epqr`, `assignment`, `done`. Reminders and the PIN stay on the phone, after `assignment`.
- Worked out from what's saved, so the app reopens at the right screen on any phone. Students only.

### 3.2 Study entry: consent, assessments, assignment

| Method | Path                     | Body                                                  | Returns                                                                                               |
| ------ | ------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| POST   | `/v1/me/consent`         | `{ version }`                                         | `{ version, agreedAt }`                                                                               |
| GET    | `/v1/me/consent`         |                                                       | `{ version, agreedAt }` or `404`                                                                      |
| POST   | `/v1/me/phq9`            | `{ kind: "baseline" \| "final", answers: [0-3 × 9] }` | `{ id, kind, score, band, at }`                                                                       |
| GET    | `/v1/me/phq9`            |                                                       | `items` of the above                                                                                  |
| POST   | `/v1/me/epqr`            | `{ answers: [true/false × 100] }`                     | `{ id, needsSupport, takenAt }`                                                                       |
| GET    | `/v1/me/epqr`            |                                                       | `{ id, needsSupport, takenAt }` or `404 EPQR_NOT_TAKEN`                                               |
| GET    | `/v1/me/assignment`      |                                                       | `{ researcher: { id, name, title, bio, photoUrl }, method, assignedAt }`                              |
| GET    | `/v1/invite-codes/:code` |                                                       | `{ id, name, title, bio }` of the researcher behind the code, so the invite screen can show who it is |
| POST   | `/v1/me/assignment`      | `{ inviteCode? }`                                     | same as GET                                                                                           |
| POST   | `/v1/me/withdraw`        | `{ reason?, confirm: "WITHDRAW" }`                    | `{ at }`                                                                                              |

- Study data routes (`/v1/me/phq9`, `/v1/me/epqr`, `GET` and `POST /v1/me/assignment`, and every B4 data route) answer `CONSENT_REQUIRED` before consent and `STUDY_WITHDRAWN` after withdrawing, checked on each call. Account, profile, settings, consent, onboarding and withdraw don't need consent.
- Withdrawal (built in B3.4): `confirm` must be `WITHDRAW` (spaces and case ignored), as in the app. In one step the server records the withdrawal and the optional reason, closes the account (`status: "withdrawn"`) and signs the student out on every device; data saved so far stays, as the consent form says. The researcher gets an email, never with the reason. Sending again returns the first date.
- Consent is built (B2): agreeing to the same version twice keeps the first date; `GET` returns the latest, or `404` before any.
- The server scores the PHQ-9 and EPQ-R; the app doesn't send scores.
- EPQ-R scale scores are never returned to the student, matching the app.
- PHQ-9 (built in B3.2): answers are nine numbers from 0 to 3; the server scores it and returns `{ id, kind, score, band, needsSupport, takenAt }`, where `needsSupport` is true when question 9 is above zero. A `final` needs the baseline first (`PHQ9_BASELINE_FIRST`); a `final` opens once Session 8 is finished on the server (`PHQ9_FINAL_NOT_OPEN`), so the app sends waiting session progress first. Sending the same kind again returns the saved result unchanged and re-checks its alerts, so a retry after a dropped connection never loses an alert.
- PHQ-9 question 9 above zero (urgent), a final PHQ-9 at least 5 above the baseline (urgent), and a score of 20 or more raise alerts in the same request; So does EPQ-R question 76 answered Yes (urgent). If an alert can't be saved, the request fails. An unmatched student's alerts go to the study lead and move to the researcher when the student is matched.
- EPQ-R (built in B3.3): taken once, at the start. The server scores the four scales (P, E, N, L) and keeps them for the researcher; the student only gets `needsSupport` (Yes to question 76). Sending again returns the first result unchanged and re-checks its alert.
- Assignment (built in B3.1): an invite code (from the join link or typed, spaces and case ignored) always goes to that researcher, as in the app. Without a code, the student goes at random to a researcher who is accepting students and has space (10 each), preferring the fewest students. Asking again returns the same match. The researcher gets an email either way, and when nobody has space every study lead is told a student is waiting; a failed email never undoes the match.
- `GET /v1/invite-codes/:code` uses the strict rate limit, so codes can't be guessed in bulk.

Errors: `CONSENT_REQUIRED` (403, on any `/v1/me/...` data call before consent), `PHQ9_BASELINE_FIRST` (409), `PHQ9_FINAL_NOT_OPEN` (409), `EPQR_NOT_TAKEN` (404), `ASSIGNMENT_NO_RESEARCHER` (503, nobody has space), `ASSIGNMENT_CODE_NOT_FOUND` (404), `WITHDRAW_CONFIRM_MISMATCH` (400), `STUDY_WITHDRAWN` (403).

### 3.3 Sessions

| Method | Path                                 | Body                                         | Returns                                                                     |
| ------ | ------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/v1/me/sessions?since=<serverTime>` |                                              | `{ items: [session], serverTime }`: all, or only what changed after `since` |
| PUT    | `/v1/me/sessions/:sessionId`         | `{ done, answers, completedAt?, updatedAt }` | `session`                                                                   |

- `session`: `{ sessionId (1-8), done: [moduleId], answers: { stepId: answer }, completedAt, updatedAt }`.
- An `answer` is a number, a list of numbers, a list of strings, true/false or text, exactly as the app saves it today.
- Built in B4.1. The phone sends the whole record for that session with `updatedAt`, the time it made the change; the newest change wins, and an older one gets `SYNC_STALE_UPDATE` with the saved record. Sending the same change twice is safe. A finished session stays finished, whatever an older phone sends later.
- Sessions follow the sync rules in 3.4; `since` is the server's `serverTime` from the last pull, never the phone's clock.

Errors: `SESSION_NOT_FOUND` (404, outside 1 to 8), `SYNC_STALE_UPDATE` (409), `CONSENT_REQUIRED` and `STUDY_WITHDRAWN` (403).

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

1. The phone keeps the server's `serverTime` from its last successful pull and sends it as `since`; the server compares it with when it saved each change, so a phone with the wrong clock still gets everything.
2. Changes made offline wait in a queue on the phone and are sent oldest first when back online, retrying with growing gaps.
3. `PUT` with the same `id` twice is safe; the second just updates.
4. Every `PUT` carries `updatedAt`, when the phone made the change. If the phone and server both changed an item, the newer `updatedAt` wins.
5. Synced data belongs to one student: if someone else signs in on the phone, its waiting changes and copies are cleared before anything is sent.
6. After sending its queue, the phone pulls with `since`, then stores `serverTime` for next time.

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

## 4b. Emails and notifications

**Email** is sent through Unosend. **Push** arrives in B6. Emails and pushes never contain names, answers, scores or message text: generic words, then "open the app". Reminder settings are respected, except urgent safety alerts, which always send. A failed email never undoes the action that sent it.

| Who        | When                                                               | Email                                   | Push | Status                                   |
| ---------- | ------------------------------------------------------------------ | --------------------------------------- | ---- | ---------------------------------------- |
| Student    | Signs up, or asks for a new code                                   | Verification code                       |      | Built (B2.3)                             |
| Student    | Forgot password                                                    | Reset code                              |      | Built (B2.3)                             |
| Student    | Password changed                                                   | "Your password was changed"             |      | Built (B3.3)                             |
| Student    | Matched with a researcher                                          |                                         | Yes  | B6                                       |
| Student    | New weekly session opens (`notifySessions`)                        |                                         | Yes  | B6                                       |
| Student    | Daily mood check at the chosen time (`notifyMood`)                 |                                         | Yes  | B6                                       |
| Student    | Check-in booked, moved or cancelled (`notifyCheckIns`)             |                                         | Yes  | B6                                       |
| Student    | Check-in in 1 hour, and when Join opens                            |                                         | Yes  | B6                                       |
| Student    | New message from the researcher (`notifyMessages`), never the text |                                         | Yes  | B6                                       |
| Student    | Final PHQ-9 due after Session 8                                    |                                         | Yes  | B6                                       |
| Student    | Question 9, EPQ-R 76 or risk words                                 |                                         |      | The app shows the support screen at once |
| Researcher | Invited by the study lead                                          | Invite link                             |      | Built (B2.4)                             |
| Researcher | A student joins with their code                                    | "Kemi accepted your invite"             | B6   | Email built (B3.1)                       |
| Researcher | A student is matched at random                                     | Same email                              | B6   | Built (B3.3)                             |
| Researcher | Urgent alert (question 9, EPQ-R 76, risk words, final PHQ-9 up 5+) | "An urgent alert needs your attention"  | B6   | Email built (B3.2, B3.3)                 |
| Researcher | Alerts waiting from before the student was matched                 | Same urgent email                       | B6   | Built (B3.2)                             |
| Researcher | Non-urgent alert (severe score, inactive 5 days)                   |                                         | B6   | In app only                              |
| Researcher | New message from a student (`notify.messages`)                     |                                         | Yes  | B6                                       |
| Researcher | Their check-in is about to start (`notify.calls`)                  |                                         | Yes  | B6                                       |
| Researcher | A student withdraws                                                | Yes                                     | B6   | Email built (B3.4)                       |
| Study lead | Urgent alert for a student with no researcher yet                  | Same urgent email                       |      | Built (B3.2)                             |
| Study lead | Matching fails because every researcher is full                    | "A student is waiting for a researcher" |      | Built (B3.3)                             |

## 5. Tables

One Prisma model per file under `prisma/schema/<module>/`. Every table has `id`, `createdAt` and `updatedAt` unless noted. Synced tables also have `deletedAt`.

| Phase | Model              | Main fields                                                                                                                                  |
| ----- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| B0    | User               | email, passwordHash (B2.1), role, status, emailVerifiedAt (B2.3)                                                                             |
| B0    | AuditLog           | actorId, action, targetType, targetId, metadata, requestId (append-only)                                                                     |
| B2    | StudentProfile     | userId, name, dateOfBirth, isUndergraduate, avatarId, notifySessions, notifyMood, moodReminderTime, notifyMessages, notifyCheckIns, joinedAt |
| B2    | ResearcherProfile  | userId, name, title, bio, capacity, accepting, inviteCode; photoUrl, hours and notify in B5                                                  |
| B2    | RefreshToken       | userId, tokenHash, familyId, expiresAt, revokedAt                                                                                            |
| B2    | EmailCode          | userId, purpose (verify email or reset password), codeHash, expiresAt, attempts, usedAt                                                      |
| B2    | Invite             | email, name, tokenHash, invitedById, expiresAt, acceptedAt, revokedAt                                                                        |
| B2    | Consent            | studentId, version, agreedAt                                                                                                                 |
| B3    | Phq9Result         | studentId, kind (baseline or final, one each), answers, score, item9, takenAt                                                                |
| B3    | EpqrResult         | studentId (one each), answers, psychoticism, extraversion, neuroticism, lie, wishedDead, takenAt                                             |
| B3    | Assignment         | studentId, researcherId, method, assignedAt                                                                                                  |
| B3    | Withdrawal         | studentId (one each), reason, withdrawnAt; kept after the account closes                                                                     |
| B3    | Alert              | studentId, researcherId (empty until matched), kind, urgent, title, quote, detail, sourceId (one alert per kind and source), raisedAt        |
| B4    | SessionProgress    | studentId, sessionId, done, answers (JSON), completedAt, updatedAt (the phone's change time), syncedAt (the server's save time)              |
| B4    | MoodEntry          | studentId, mood, note, at                                                                                                                    |
| B4    | JournalEntry       | studentId, prompt, text (encrypted), mood, sessionId, at, editedAt                                                                           |
| B4    | ThoughtRecord      | studentId, situation, thought, feeling, action, traps, sessionId, balanced, beliefBefore, beliefAfter, at                                    |
| B4    | PlannedActivity    | studentId, date, slot, label, predicted, sessionId, doneAt, enjoy, achieve                                                                   |
| B4    | ToolkitItem        | studentId, cardId                                                                                                                            |
| B4    | ToolUse            | studentId, cardId, helped, at                                                                                                                |
| B4    | StressEntry        | studentId, situation, level, helped, at                                                                                                      |
| B4    | PositiveEntry      | studentId, kind, text, at                                                                                                                    |
| B4    | WellPlan           | studentId, triggers, signs, actions, people, note, goal (JSON)                                                                               |
| B4    | HomeworkTick       | studentId, sessionId, date                                                                                                                   |
| B4    | CrisisPlanProgress | studentId, partsFilled                                                                                                                       |
| B5    | AlertEvent         | alertId, actorId, type, text, at                                                                                                             |
| B5    | CheckIn            | studentId, researcherId, startsAt, durationMin, note, seriesId, cancelledAt                                                                  |
| B5    | CallNote           | checkInId, attended, minutes, outcome, note (encrypted)                                                                                      |
| B5    | CallFeedback       | checkInId, rating, note, callSeconds                                                                                                         |
| B5    | EmergencyContact   | studentId, name, relationship, phone (all encrypted)                                                                                         |
| B6    | Message            | studentId, researcherId, from, text, sentAt, readAt, flagged                                                                                 |
| B6    | Conversation       | studentId, researcherId, followUp, researcherReadAt                                                                                          |
| B6    | PushToken          | userId, token, platform                                                                                                                      |

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
