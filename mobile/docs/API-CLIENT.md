# How the app talks to the backend

Rules for every screen and feature that uses the ThriveCBT API. The backend's own rules are in the repo root's `AGENTS.md`; the endpoints are in `docs/api/contract.md`.

## The stack

| Job                                                           | Tool                                                 |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| HTTP                                                          | axios, one instance in `src/lib/axios.ts`            |
| Server data (loading, caching, refreshing)                    | TanStack Query                                       |
| Phone-only state (login status, PIN, device settings, drafts) | Zustand                                              |
| Form and input checks                                         | Zod, the same rules as the backend                   |
| API types                                                     | Generated from the backend's `docs/api/openapi.json` |

**TanStack Query owns everything that comes from the server. Zustand owns state that only lives on the phone. Server data is never copied into Zustand.**

## Folder layout

```
src/
├── app/                     Expo Router routes only (every file here is a screen)
│   └── _layout.tsx          wraps everything in <AppProvider>
├── providers/
│   ├── AppProvider.tsx      gestures + QueryProvider
│   └── QueryProvider.tsx
├── config/
│   └── env.ts               EXPO_PUBLIC_API_URL, checked at startup
├── lib/
│   ├── axios.ts             the only network code: token, request id, timeout, refresh on 401
│   ├── api-error.ts         ApiError, NETWORK_ERROR / TIMEOUT, fieldErrors()
│   ├── query-client.ts      TanStack defaults
│   ├── session.ts           startSession, endSession, restoreSession, refreshTokens
│   ├── secure-storage.ts    the refresh token (expo-secure-store only)
│   ├── zustand-storage.ts   kv-store adapter for persisted Zustand stores
│   ├── storage.ts           kv-store helpers (existing)
│   └── sync/                the offline sync engine: queue.ts (waiting changes), engine.ts (send, pull, retry)
├── stores/
│   └── session.store.ts     Zustand: signed in or out, the user, the access token (memory)
├── features/<feature>/
│   ├── api/<feature>.service.ts   plain functions that call `api`, plus query keys
│   ├── components/
│   ├── hooks/               React hooks: use<Thing>, use<Action>, and screen-wide hooks
│   ├── schemas/             Zod checks for forms
│   ├── screens/             imported by the route files in src/app
│   ├── types/               feature types, narrowed from src/types/api.ts
│   ├── utils/               pure helpers (formatting, rules, small calculations)
│   ├── store/               phone storage for this feature (Zustand or kv-store)
│   ├── constants/           fixed values and lists
│   ├── <action>.ts          a feature-wide action used by several screens, e.g. signOut.ts
│   └── index.ts             what other features may import
├── components/ui/  components/shared/   building blocks used across features
├── hooks/                   hooks used across features, e.g. useStudentSync
└── types/
    ├── api.ts               generated; never edited by hand
    └── api-helpers.ts       ResponseOf<path, method>, BodyOf<path, method>
```

Every feature uses this layout. Loose files at the feature's root are only `index.ts` and a feature-wide action like `signOut.ts`; everything else goes in the matching folder. A folder is created when its first file arrives. Features still on phone storage are moved into this layout when they're next changed.

## Rules

1. **Only `src/lib/axios.ts` makes network calls.** Services call `api`, hooks call services, screens and components use hooks. Never `fetch` or `axios` anywhere else.
2. **Import another feature only through its `index.ts`**: `@/features/auth`, never `@/features/auth/hooks/useLogin`.
3. **Types come from the backend.** After the backend changes an endpoint, run `npm run api:types`. If a field changed, the app stops compiling until it's handled. Use `ResponseOf` and `BodyOf` instead of writing response types by hand.
4. **Query keys live in the feature's service file** as a small factory (`profileKeys.detail()`), never typed inline.
5. **A mutation refreshes what it changed**: set or invalidate the affected query keys in `onSuccess`.
6. **Retries:** queries retry once, only when offline or timed out; never on a 4xx. Mutations never retry automatically.
7. **Errors are `ApiError`.** Screens decide what to do from `error.code`, never the wording; the server's `message` is safe to show. Field errors from `VALIDATION_FAILED` go under their inputs through `fieldErrors()`. `NETWORK_ERROR` and `TIMEOUT` are the app's own codes.
8. **Loading states** (components in `src/components/ui/`):
   - **A mutation** (save, send, log in): `<Button loading={mutation.isPending}>` shows a spinner in place of the label and blocks a second tap.
   - **A query's first load**: `Skeleton`, `SkeletonText` and `SkeletonCircle` in the shape of the content that's coming, never a blank screen.
   - **A refresh in the background**: no loader; the saved data stays on screen.
   - **Nothing to show and no known layout** (for example while working out where to resume): `PageLoader`, a centred `Spinner` with an optional message.
   - Skeletons stay still when the phone asks for reduced motion.
9. **Login tokens:** the refresh token lives only in secure storage; the access token only in memory. Nothing else stores either, and neither is ever logged.
10. **Signing out** goes through `endSession()`: it clears the refresh token, the query cache and the session store, then tells the server.
11. **A 401 refreshes once and repeats the request once**, with one refresh shared by every request that failed together. If the login can't be renewed, the app signs out. If the phone is offline, it stays signed in.
12. **Zustand stores stay small and phone-only.** Persist with `kvStorage`, never secrets.
13. **Never log request or response bodies, tokens, codes or passwords.**
14. **Moving off mock data happens feature by feature**: when a feature switches to the API, its mock code is deleted in the same change.
15. **Phone copies, for now.** Many screens still read the student's name, consent, settings, PHQ-9 scores and researcher from the older phone stores (`onboardingStore`, `consentStore`, `lib/preferences`, the assessment `scoreHistory`, the assignment store), which also keeps the app working offline. Those copies are only ever written from server responses: after a successful save, and after login or app open (`pullStudentToPhone`). Moving a screen to `useProfile()` and friends removes its need for the copy. These phone stores are imported directly until their feature moves; everything else goes through a feature's `index.ts`.
16. **Resuming onboarding:** after login, and when a logged-in student without a PIN opens the app, `resumeRoute()` asks `GET /me/onboarding` for the next step and opens that screen, through the PHQ-9, EPQ-R and matching. Offline, the app carries on as it was.
17. **Errors that mean the same everywhere** are handled once, in `useSessionWatch`, for every query and mutation: `STUDY_WITHDRAWN` and `AUTH_ACCOUNT_WITHDRAWN` sign the student out and open the withdrawn screen; `CONSENT_REQUIRED` opens the study information. Screens only handle their own errors.
18. **Safety answers are saved the moment the last screen opens**, not when the student taps Continue: the PHQ-9 results and the EPQ-R done screen send the answers straight away, so an alert reaches the researcher even if the app is closed on the support screen. The support screen shows at once from the phone's answers; Continue waits for the save and offers Try again if it failed. Sending again is safe because the server keeps the first result.
19. **Synced student data** (sessions, moods and the journal now, the rest of the B4 tools next) never goes through TanStack Query. The feature's phone store saves first, so it works offline, then calls `queueChange()` with the whole item and the time of the change; the engine sends waiting changes oldest first, retries with growing gaps (5 seconds up to 5 minutes), and pulls with the last `serverTime`. Each kind registers itself with `registerSyncKind()` (`applyServerItems`, `uploadLocal` for data saved before sync, `clearLocal`), and `src/hooks/useStudentSync.ts` imports the feature so it's registered. Sync runs on sign-in, when the app comes back to the front, and whenever a change is waiting. If a different student signs in on the phone, the previous student's waiting changes and copies are cleared first. Items made on the phone get their id there (`Crypto.randomUUID()`), and a pulled item with `deletedAt` is removed from the phone.

## Running against the backend

1. Start the backend from the repo root: `npm run start:dev`.
2. Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL` to your Mac's Wi-Fi address with `:3000/v1`. A simulator can use the default `http://localhost:3000/v1`.
3. Start the app: `npx expo start`.

## Tests

- `test/lib/`: the client (token and request id, one shared refresh, sign-out when renewal fails, staying signed in offline), error mapping, retry rules.
- Each feature's service and hooks are tested with the API faked, never a real server.
