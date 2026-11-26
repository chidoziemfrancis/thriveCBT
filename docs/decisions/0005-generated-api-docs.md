# 0005 Swagger and Postman generated from the code

Status: Accepted
Date: 2026-11-26

## Decision

- Swagger at `/v1/docs`, built from the Zod schemas; on locally and on staging, off in production.
- `npm run docs:openapi` writes `docs/api/openapi.json`; `npm run docs:postman` converts it into the Postman collection. Both files are committed.
- CI regenerates them and fails if they differ from what's committed.
- Postman environments hold addresses and empty variables only.

## Options considered

- Writing the Postman collection by hand: drifts from the API within weeks.
- Swagger only: fine for reading, but the team asked for Postman to call the API with saved logins.

## Consequences

- Docs are always as current as the code.
- Every endpoint change includes regenerated docs in the same pull request.
