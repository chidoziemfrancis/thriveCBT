# 0002 Zod for validation and Swagger

Status: Proposed (confirm before B0 code)
Date: 2026-11-26

## Context

Every request must be checked, and Swagger must describe the same shapes.

## Decision

Zod schemas in each feature's `dto/` folder, used by a global validation pipe and turned into Swagger through nestjs-zod.

## Options considered

- class-validator with class-transformer: the classic NestJS way, but each field needs decorators for validation and separate ones for Swagger, and the types are written twice.

## Consequences

- One schema gives validation, the TypeScript type and the docs.
- Schemas could later be shared with the mobile app.
