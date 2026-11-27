# AGENTS.md (mobile app)

The ThriveCBT Expo app for students and researchers. Read this before changing the app.

- **Talking to the backend:** follow [docs/API-CLIENT.md](docs/API-CLIENT.md). Only `src/lib/axios.ts` makes network calls; server data lives in TanStack Query, phone-only state in Zustand.
- **Screens and design:** [docs/SCREENS.md](docs/SCREENS.md) lists every screen and its status.
- **Feature folders:** every feature uses `api/`, `components/`, `hooks/`, `schemas/`, `screens/`, `types/`, `utils/`, `store/` and `constants/`, with only `index.ts` (and a feature-wide action like `signOut.ts`) loose at its root. See `features/auth/` and [docs/API-CLIENT.md](docs/API-CLIENT.md).
- **Routes:** every file in `src/app/` becomes a screen, so only route files go there; screens live in `src/features/<feature>/screens/`.
- **Before every commit:** `npx expo lint`, `npx prettier --check src test`, `npx tsc --noEmit`, `npx jest`. After a backend endpoint changes: `npm run api:types`.
- **Comments:** avoid them; one short line only to explain why.
- **No `eslint-disable`, no secrets in the app, no logging of tokens, codes or health data.**
