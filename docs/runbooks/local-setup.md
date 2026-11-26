# Local setup

Status: target steps for B0. Checked end to end once B0 is merged.

## Needs

- Node 22 or newer
- Docker Desktop, running

## Steps

```bash
npm install
cp .env.example .env        # then set FIELD_ENCRYPTION_KEY, see below
npm run db:up               # starts PostgreSQL in Docker
npm run db:migrate          # creates the tables
npm run db:seed             # adds test accounts
npm run start:dev           # http://localhost:3000/v1/health
```

Swagger: http://localhost:3000/v1/docs

### Encryption key

Generate a local key and put it in `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Never reuse a local key on staging or production.

## Tests

```bash
npm run test         # unit tests
npm run test:e2e     # end-to-end, uses the thrivecbt_test database
```

## Start again from an empty database

```bash
npm run db:reset     # drops, migrates and seeds
```

## Troubleshooting

| Problem                               | Fix                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| App stops at startup naming a setting | That setting is missing or wrong in `.env`                                                   |
| `/v1/health` returns 503              | PostgreSQL isn't running: `npm run db:up`                                                    |
| Port 5432 already in use              | Another PostgreSQL is running; stop it or change the port in `docker-compose.yml` and `.env` |
