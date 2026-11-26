# 0001 Prisma 7.10.1 with one model per file

Status: Accepted
Date: 2026-11-26

## Context

The backend will hold about 35 models across 20 modules. A single `schema.prisma` that long is hard to review and causes merge conflicts.

## Decision

- Use Prisma, pinned to 7.10.1 (stable since October 2026). Prisma's npm `latest` tag currently points at an 8.0 release candidate, so the version is pinned rather than following `latest`.
- Use Prisma's schema folder: `prisma/schema/base.prisma` holds only the generator and database; each model lives in its own file under a folder named after its module, e.g. `prisma/schema/assessments/phq9-result.prisma`.
- An enum lives in the file of the model that uses it.
- Generated client goes to `src/generated/prisma/` and is not committed.

## Options considered

- Drizzle: lighter, SQL-like, but schema files are TypeScript and migrations are less guided.
- TypeORM: decorator style that fits NestJS, but weaker types and a history of migration surprises.

## Consequences

- Each model change is a small, focused diff.
- Prisma upgrades are deliberate: bump the pin, read the release notes, run all tests.
