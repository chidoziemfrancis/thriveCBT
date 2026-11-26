# Local setup

Checked on macOS with a local PostgreSQL 14. The Docker route is written but still to be checked end to end.

## Needs

- Node 22 or newer
- PostgreSQL: either Docker Desktop, or a local PostgreSQL (for example Homebrew)

## Steps

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # then fill it in, see below
npm run db:migrate          # creates the tables
npm run db:seed             # adds test accounts
npm run start:dev           # http://localhost:3000/v1/health
```

Swagger: http://localhost:3000/v1/docs

## Database

### Option A: Docker

```bash
npm run db:up               # PostgreSQL 17 on port 5433
```

The `.env.example` addresses already point at it. `npm run db:down` stops it; the data stays in a Docker volume.

### Option B: a local PostgreSQL

Create the database, then point `.env` at it (Homebrew uses your Mac username and no password):

```bash
createdb thrivecbt
```

```
DATABASE_URL=postgresql://<your-username>@localhost:5432/thrivecbt
```

If `brew services` fails, start it directly:

```bash
pg_ctl -D /opt/homebrew/var/postgresql@14 -l /opt/homebrew/var/postgresql@14/server.log start
```

## Encryption key

Generate a local key and put it in `.env` as `FIELD_ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Never reuse a local key on staging or production.

## Tests

```bash
npm run test         # unit tests
```

## API docs

```bash
npm run docs         # regenerates docs/api/openapi.json and the Postman collection
```

## Start again from an empty database

```bash
npm run db:reset     # drops, migrates and seeds the development database
```

## Troubleshooting

| Problem                                           | Fix                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| App stops at startup naming a setting             | That setting is missing or wrong in `.env`                                    |
| `/v1/health` returns 503 `HEALTH_DATABASE_DOWN`   | PostgreSQL isn't running, or `DATABASE_URL` is wrong                          |
| Docker commands hang                              | Restart Docker Desktop (Troubleshoot → Restart), or use Option B              |
| `npm install` fails with a cache permission error | Your npm cache has root-owned files: `sudo chown -R $(id -u):$(id -g) ~/.npm` |
