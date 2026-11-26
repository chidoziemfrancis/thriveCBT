# thriveCBT

Digital CBT study platform.

| Path      | What it is                             |
| --------- | -------------------------------------- |
| `src/`    | NestJS backend API (this root package) |
| `mobile/` | Student app (Expo / React Native)      |
| `pwa/`    | Web app (Next.js)                      |

`mobile/` and `pwa/` are separate npm projects with their own `package.json`;
run their scripts from inside those folders.

## Backend

Requires Node 22+ and PostgreSQL (Docker or local). Full guide: [docs/runbooks/local-setup.md](docs/runbooks/local-setup.md).

```bash
npm install
cp .env.example .env      # fill in FIELD_ENCRYPTION_KEY and the database addresses
npm run db:migrate && npm run db:seed
npm run start:dev         # http://localhost:3000/v1/health · docs at /v1/docs
```

Rules for working on the backend: [AGENTS.md](AGENTS.md). Plan and to-do: [docs/](docs/README.md).
