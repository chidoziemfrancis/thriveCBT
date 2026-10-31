# thriveCBT

Digital CBT study platform.

| Path      | What it is                                   |
| --------- | -------------------------------------------- |
| `src/`    | NestJS backend API (this root package)       |
| `test/`   | Backend end-to-end tests                     |
| `mobile/` | Student app (Expo / React Native)            |
| `pwa/`    | Web app (Next.js)                            |

`mobile/` and `pwa/` are separate npm projects with their own `package.json`;
run their scripts from inside those folders.

## Backend

Requires Node 22+.

```bash
npm install
cp .env.example .env
npm run start:dev      # http://localhost:3000
```

### Environment

| Variable | Default | Purpose          |
| -------- | ------- | ---------------- |
| `PORT`   | `3000`  | HTTP listen port |

### Scripts

| Script                 | Does                                        |
| ---------------------- | ------------------------------------------- |
| `npm run start:dev`    | Start with file watching                    |
| `npm run build`        | Compile to `dist/`                          |
| `npm run start:prod`   | Run the compiled build                      |
| `npm run lint`         | oxlint over `src/` and `test/`              |
| `npm run format:check` | Prettier check over `src/` and `test/`      |
| `npm run typecheck`    | `tsc --noEmit`                              |
| `npm test`             | Unit tests (Vitest, `src/**/*.spec.ts`)     |
| `npm run test:e2e`     | End-to-end tests (`test/**/*.e2e-spec.ts`)  |

### Endpoints

| Method | Path | Response              |
| ------ | ---- | --------------------- |
| GET    | `/`  | `200` `Hello World!`  |
