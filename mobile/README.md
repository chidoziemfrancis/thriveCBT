# ThriveCBT mobile

The ThriveCBT mobile app: an 8-week digital CBT programme for undergraduate students, with weekly researcher support. Built with Expo and Expo Router.

## Run it

```bash
npm install
npx expo start -c
```

Scan the QR code with Expo Go (iPhone camera or the Expo Go app on Android), or press `i` / `a` for a simulator. Haptics only work on a real phone.

## Scripts

| Script | What it does |
|---|---|
| `npm run lint` | ESLint plus a Prettier check of `src` and `test` |
| `npm run format` | Prettier on `src` and `test` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest unit tests |
| `npm run build` | Exports the iOS and Android bundles to `dist/` |

## Project structure

```
src/
  app/          Expo Router routes. Each file only re-exports a screen, so URLs live here
                and screen code lives in features/.
  features/     One folder per product area. A feature owns its screens, its components
                and its data (stores, constants, pure logic).
    auth/         Sign-in, email verification, the user session
    onboarding/   Welcome, name, birthday, eligibility, what to expect
    assessment/   PHQ-9 questions, scoring and results
    home/         Home screen
  components/   Shared UI used by more than one feature
    ui/           Buttons, fields, screen wrapper, step header
    icons/        SVG icons
    mascot/       Sprout and the speech bubble
  lib/          Shared helpers with no UI: on-device storage, haptics, dates
  theme/        Colours, fonts, radii and type styles
test/           Unit tests, mirroring src/ (test/features/…, test/lib/…)
```

**Where new code goes:**
- A new screen goes in `src/features/<area>/screens/`, plus a one-line route file in `src/app/` that re-exports it.
- A component used by one feature stays in that feature's `components/`. It moves to `src/components/` once a second feature needs it.
- Logic with no UI goes next to the feature that owns it, or in `src/lib/` if it's shared. Give it a unit test in the matching `test/` folder.
- Import with the `@/` alias (`@/features/assessment/phq9`, `@/components/ui/Button`) rather than relative paths across folders. Tests use it too.
