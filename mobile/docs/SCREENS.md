# ThriveCBT — Screen Map

Every screen the ThriveCBT mobile app needs for the 8-week dCBT study, for both sides of the app: **students** (participants) and **researchers** (who support and monitor their students).

One mobile app serves both roles. The role is set when the account is created, and each role sees its own navigation after sign-in. The study lead's admin tools are a separate website, built after the MVP (section 4).

**Status key:** ✅ Built · 🟡 Placeholder · ⬜ To build

---

## 1. How students get a researcher

Every student is linked to exactly one researcher. There are two ways in:

| Path | How it works | Result |
|---|---|---|
| **Invited** | A researcher sends an invite link or 6-character code (WhatsApp, email, QR). The student opens it, or types the code at sign-up. | The student is assigned to **that researcher**. |
| **Self sign-up** | A student downloads the app and signs up with no invite. | After screening, the student is assigned to a **random researcher** who has space. |

**Random assignment rules:**
- Only researchers marked as accepting students, and under their capacity limit, can be picked.
- Among those, pick at random. Weighting towards the researcher with the fewest students keeps caseloads even.
- If no researcher has space, the student waits on a "Finding your researcher" screen and is assigned as soon as one frees up. The dev team is alerted (the study lead, once the admin website exists).
- The assignment is saved with how it happened (invite or random) and when, for the study's records.

Either way, the student then sees a **"Meet your researcher"** screen, so they know who is supporting them before Session 1.

---

## 2. Student screens

### 2.1 Welcome and account

| # | Screen | What it does | Status |
|---|---|---|---|
| S1 | Splash | Logo while the app loads | ✅ |
| S2 | Welcome | Mascot, app promise, "Get started" or "I already have an account" | ✅ |
| S3 | Invite code | "Got an invite from a researcher?" Enter a code, or skip. Opening an invite link fills it in automatically. | ⬜ |
| S4 | Email | Enter email; existing accounts go to the password step | ✅ |
| S5 | Create password | Set a password for a new account | ✅ |
| S6 | Verify email | 6-digit code with resend timer | ✅ |
| S7 | Sign in (password) | Returning student enters password | ✅ |
| S8 | Forgot password | Request a reset code | ⬜ |
| S9 | Reset password | Enter the code and a new password | ⬜ |

### 2.2 Consent and screening

| # | Screen | What it does | Status |
|---|---|---|---|
| S10 | Study information | Plain-language summary of the study: what it involves, time needed, risks, who sees the data | ✅ (draft wording) |
| S11 | Informed consent | Consent checkboxes and agreement, with a copy saved to the account. Required before any data is collected. | ✅ (draft wording) |
| S12 | Name | First name or nickname | ✅ |
| S13 | Birthday | iOS-style month/day/year wheels, shows age | ✅ |
| S14 | Undergraduate check | Yes/No eligibility question | ✅ |
| S15 | Not eligible | Kind message if the student doesn't meet the criteria (not an undergrad, under the age limit), with support links | ⬜ |
| S16 | What to expect | The study journey: check-in, 8 sessions, weekly calls, final check-in | ✅ |
| S17 | PHQ-9 question (×9) | Baseline check-in, one question per screen, slider and 14-day visual | ✅ |
| S18 | PHQ-9 results | Starting score and severity band | ✅ |
| S19 | Crisis support | Shown instead of results if question 9 is above "Not at all": support options, alerts the researcher | ✅ (alert ⬜) |

### 2.3 Researcher assignment

| # | Screen | What it does | Status |
|---|---|---|---|
| S20 | Finding your researcher | Short animated wait while assignment runs. Stays up if no researcher has space yet. | ✅ (mock researchers) |
| S21 | Meet your researcher | Photo, name, short bio, how and when they'll be in touch, first check-in time | ✅ (mock researchers) |
| S22 | Notification permission | Explains why reminders help, then asks for push permission | ⬜ |

### 2.4 Main app (tab bar: Home · Sessions · Journal · Progress)

| # | Screen | What it does | Status |
|---|---|---|---|
| S23 | Home | Week X of 8, current session card, this week's checklist, mood check, next researcher call, emergency button | ✅ |
| S24 | Sessions path | Duolingo-style path of the 8 sessions: done, current, locked | ✅ |
| S25 | Session overview | Title, focus, the session's modules and progress, "Begin" or "Continue" | ✅ |
| S26 | Session complete | Celebration, what was learned, homework for the week | ✅ |
| S27 | Journal list | All entries, newest first, with prompts and mood tags | ⬜ |
| S28 | Journal entry | Write or edit an entry; clearly shows whether the researcher can read it | ⬜ |
| S29 | Progress | Mood trend graph, PHQ-9 baseline vs final, sessions done, activity levels | ⬜ |
| S30 | Daily mood check | Faces gauge (sad to happy) with optional note | ✅ (on Home; note ⬜) |
| S31 | Badges | Rewards earned for sessions and activities (Session 5 gamification) | ⬜ |

### 2.5 Session modules (reusable templates)

The 8 sessions are built from a small set of reusable module screens, not 40 one-off screens. Each session's content is data that fills these templates.

| # | Module template | Used in sessions | Status |
|---|---|---|---|
| M1 | Lesson (psychoeducation cards) | 1, 2, 3, 5, 6, 7 | ✅ (Session 1) |
| M2 | Video player | 1 ("What Happens in Depression?") and others | 🟡 (placeholder card, video not produced) |
| M3 | Mood self-check (5 ratings) | 1, 2 | ✅ (Session 1) |
| M4 | Quiz | 1, 7 (strengths quiz) | ✅ (Session 1) |
| M5 | Reflection journal prompt | 1, 7 | ✅ (Session 1) |
| M6 | Interactive diagram (CBT triangle) | 2 | ⬜ |
| M7 | Scenario exercise (pick the thought, feeling, behaviour) | 2, 4 | ⬜ |
| M8 | Emotion picker | 2 | ⬜ |
| M9 | Thought diary (event → thought → emotion → intensity) | 2, 3 | ⬜ |
| M10 | Drag-and-drop matching (distortion ↔ statement) | 3 | ⬜ |
| M11 | Evidence for and against worksheet | 4 | ⬜ |
| M12 | Guided questions ("Is this 100% true?", "What would you tell a friend?") | 4 | ⬜ |
| M13 | Balanced thought builder | 4 | ⬜ |
| M14 | Activity scheduler (weekly planner) | 5 | ⬜ |
| M15 | Motivation and enjoyment scale | 5 | ⬜ |
| M16 | Relaxation audio player (breathing, muscle relaxation, grounding) | 6 | ⬜ |
| M17 | Stress trigger tracker | 6 | ⬜ |
| M18 | Coping skills library | 6 | ⬜ |
| M19 | Crisis coping plan | 6 | ⬜ |
| M20 | Core belief explorer | 7 | ⬜ |
| M21 | Positive data log (strengths, wins, kind feedback) | 7 | ⬜ |
| M22 | Self-compassion exercise | 7 | ⬜ |
| M23 | Relapse prevention plan (triggers, warning signs, coping, support) | 8 | ⬜ |
| M24 | Skills summary | 8 | ⬜ |
| M25 | Future goal planner | 8 | ⬜ |
| M26 | Homework tracker | All | ⬜ |

### 2.6 Researcher contact

| # | Screen | What it does | Status |
|---|---|---|---|
| S32 | My researcher | Profile, next call, message, WhatsApp, call options | ⬜ |
| S33 | Chat with my researcher | One-to-one mini chat with their own researcher only (see 2.6a) | ✅ (mock researcher) |
| S34 | Upcoming check-in | Date and time of the weekly call, reschedule request, add to calendar | ✅ (mock schedule) |
| S35 | Pre-call check | Camera and mic preview, "Join call" | ✅ |
| S36 | Video call | In-call screen: video, mute, camera, end | ✅ (demo; live video needs Daily.co) |
| S37 | After the call | Quick "How did that feel?" rating | ✅ |

### 2.6a Mini chat (student ↔ researcher)

A simple one-to-one chat so a student can message their researcher between weekly calls, and the researcher can follow up. It is **not** a crisis line, and the design has to make that clear without putting students off.

| # | Screen / part | What it does | Status |
|---|---|---|---|
| C0 | Floating chat button | Round chat button fixed at the bottom-right, just above the tab bar, on every student tab (Home, Sessions, Journal, Progress). Shows the researcher's initials or a chat icon, with an unread count badge and a gentle bounce when a new message arrives. Tapping it opens the chat (C2). Hidden on the chat itself, the Help screen, onboarding, and while the keyboard is open. Tab screens get extra bottom padding so it never covers a button. Before a researcher is assigned it opens a "You'll be able to chat once you're matched" note. | ✅ (mock researcher) |
| C1 | Other chat entry points | "Message Tunde" on the Home check-in card and on My researcher (S32), with the same unread badge | ✅ (mock researcher) |
| C2 | Chat screen | Researcher's avatar and name in the header, with their usual reply hours ("Usually replies within a day, Mon–Fri"). Message bubbles with date separators. Sent, delivered and read ticks. Typing indicator. Text and emoji input, plus a small "Not for emergencies, tap Help" link above the input. | ✅ (mock researcher) |
| C3 | Empty chat | First-time state: the researcher's intro and a few suggested openers ("Hi, I have a question about this week's session") | ✅ (mock researcher) |
| C4 | Risk message prompt | If a student's message contains risk words (for example "kill myself" or "end it"), the message still sends, the Help sheet opens straight away, and the researcher gets an alert (R18) | ✅ (placeholder word list, researcher alert ⬜) |
| C5 | New message notification | Push notification and in-app unread badge. The preview says "New message from Tunde", never the message text, so nothing private shows on the lock screen. | ⬜ |
| C6 | Offline and failed sends | Messages queue while offline and show "Not sent, tap to retry" if they fail | ⬜ |

**Chat rules (both sides):**
- Each student can only message their own assigned researcher. No student-to-student chat.
- MVP is text and emoji only. Photos and voice notes come after the MVP.
- Researchers set reply hours (R4). Outside them, the student sees "Tunde will reply when they're back", plus the Help link.
- Messages are stored securely with the rest of the study data, and students are told this in the study information (S10).
- A risk keyword never blocks a message. It always reaches the researcher, and support is shown at the same time.

### 2.7 Safety and end of study

| # | Screen | What it does | Status |
|---|---|---|---|
| S38 | Emergency support | Always one tap away: crisis helpline, campus counselling, emergency contact, the student's crisis plan | 🟡 (real contacts ⬜) |
| S39 | Final PHQ-9 | Same 9 questions at week 8 | ⬜ (reuses S17) |
| S40 | Before vs after | Baseline compared with final score | ⬜ |
| S41 | Graduation | Completion certificate and badge | ⬜ |

### 2.8 Profile and settings

| # | Screen | What it does | Status |
|---|---|---|---|
| S42 | Profile | Name, email, age, sessions done, researcher | ✅ |
| S43 | Notification settings | Reminders on or off and timing | ✅ (settings saved; push needs backend) |
| S44 | Privacy | What the researcher can see; download my data | ✅ (journal access ⬜) |
| S45 | Withdraw from study | Participants can leave at any time; explains what happens to their data | ✅ (draft wording) |
| S46 | Terms of use / Privacy policy | Legal pages | 🟡 (placeholder until legal text) |
| S47 | Log out | Confirm and sign out | ✅ |

---

## 3. Researcher screens

### 3.1 Account

| # | Screen | What it does | Status |
|---|---|---|---|
| R1 | Researcher sign in | Email and password (no self sign-up; accounts are created for researchers, see section 4) | ⬜ |
| R2 | Accept researcher invite | First-time setup from their invite email: set a password | ⬜ |
| R3 | Researcher profile setup | Photo, name, short bio shown to students, contact preferences | ⬜ |
| R4 | Availability and capacity | Weekly call slots, max number of students, "accepting new students" switch | ⬜ |

### 3.2 Main app (tab bar: Students · Schedule · Messages · Alerts)

| # | Screen | What it does | Status |
|---|---|---|---|
| R5 | Researcher home | Today's calls, open alerts, students needing attention, caseload size | ⬜ |
| R6 | Student list | Every assigned student with week, last active, adherence and a risk flag; search and filter | ⬜ |
| R7 | Student detail | Profile, how they joined (invite or random), PHQ-9 baseline and latest, session progress, mood trend, homework | ⬜ |
| R8 | Student journal and homework | Entries and homework the student has shared | ⬜ |
| R9 | Weekly progress note | Write the required weekly note: adherence, symptoms, risk check, support given | ⬜ |
| R10 | Adherence overview | Logins, session completion, homework compliance across all students | ⬜ |

### 3.3 Inviting students

| # | Screen | What it does | Status |
|---|---|---|---|
| R11 | Invite students | Generate an invite link and code; share via WhatsApp, email or QR | ⬜ |
| R12 | Invites list | Pending, accepted and expired invites; resend or cancel | ⬜ |

### 3.4 Contact and calls

| # | Screen | What it does | Status |
|---|---|---|---|
| R13 | Schedule | Upcoming weekly check-ins by day | ⬜ |
| R14 | Book or move a check-in | Pick a student and a slot | ⬜ |
| R15 | Messages inbox | All student chats with unread counts and last-message preview. Chats with a risk flag sit at the top, then unread, then most recent. | ⬜ |
| R16 | Conversation | Same chat screen as the student (C2), plus a strip at the top with the student's week, today's mood and any PHQ-9 risk flag, and a link to their detail page (R7) | ⬜ |
| R16a | Quick replies | Saved short replies the researcher can tap ("Just checking in, how did this week's session go?") and edit | ⬜ |
| R16b | Follow-up flag | Mark a chat "needs follow-up" so it stays at the top of the inbox until cleared | ⬜ |
| R17 | Video call | Same call screens as the student (S35, S36), plus a notes panel | ⬜ |

### 3.5 Safety

| # | Screen | What it does | Status |
|---|---|---|---|
| R18 | Alerts inbox | Risk alerts: PHQ-9 question 9 answered above zero, severe scores, emergency button used, student inactive for X days | ⬜ |
| R19 | Alert detail | What triggered it, student contact options, mark actions taken, escalate | ⬜ |

### 3.6 Settings

| # | Screen | What it does | Status |
|---|---|---|---|
| R20 | Researcher settings | Notifications, profile, availability, log out | ⬜ |

---

## 4. Study lead (admin) — website, post-MVP

The admin side is a **separate website**, not part of the mobile app, and is built **after the MVP**. It is listed here so the app and backend are designed with it in mind.

| # | Page | What it does | Status |
|---|---|---|---|
| A1 | Researchers | Invite researchers, set capacity, pause or remove | Post-MVP |
| A2 | Assignment | Random-assignment on or off, unassigned students queue, reassign a student | Post-MVP |
| A3 | Study overview | Enrolment, completion and drop-out numbers | Post-MVP |
| A4 | Data export | Export de-identified data for analysis | Post-MVP |

**Until the admin website exists (MVP):**
- Researcher accounts are created by the dev team directly in the backend, which then sends the researcher their invite (R2).
- Random assignment runs automatically in the backend, with no on/off switch.
- Students waiting for a researcher, reassignments and data exports are handled by the dev team on request.

---

## 5. Main flows

**Invited student:**
Welcome → Invite code (filled from link) → Email → Create password → Verify → Study information → Consent → Name → Birthday → Undergrad check → What to expect → PHQ-9 ×9 → Results → Meet your researcher → Notifications → Home

**Self sign-up student:**
Welcome → Invite code (skip) → Email → Create password → Verify → Study information → Consent → Name → Birthday → Undergrad check → What to expect → PHQ-9 ×9 → Results → **Finding your researcher** → Meet your researcher → Notifications → Home

**Student at risk (PHQ-9 question 9 above zero):**
PHQ-9 → Crisis support → researcher gets an alert (R18) → student continues to assignment as normal

**Researcher:**
Accept invite → Profile setup → Availability → Home → Invite students → Student list → Student detail → Weekly note

---

## 6. Open questions for the study team

1. **Control group.** An RCT usually has a control group. Do control-group students use the app (for example, PHQ-9 only), or are they randomised outside it? If inside, the app also needs to randomise each student to a study arm.
2. **Age limit.** What is the minimum age to join? It decides when S15 "Not eligible" shows.
3. **Journal privacy.** Can researchers read every journal entry, or only ones the student chooses to share?
4. **Changing researcher.** Can a student or the study lead switch a student to another researcher mid-study?
5. **Capacity.** How many students can one researcher support at once?
6. **Crisis contacts.** Which helpline numbers and campus counselling details should S38 show?
7. **Admin website users.** One study lead, or several people managing researchers? (Post-MVP, but it affects how researcher accounts are set up now.)
8. **Chat as research data.** Are chat messages part of the study data (analysed, exported), or only for support? This changes the consent wording.
9. **Chat reply hours.** What reply time should students expect from researchers, and are weekends covered?
10. **Risk words.** Which words or phrases should trigger the chat risk prompt (C4)? A clinician on the team should approve the list.
