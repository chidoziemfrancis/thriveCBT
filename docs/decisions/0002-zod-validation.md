# 0002 Zod for validation and Swagger

Status: Accepted
Date: 2026-11-26

## Context

Every request must be checked, and Swagger must describe the same shapes.

## Decision

Zod 4 schemas in each feature's `dto/` folder. `ZodValidationPipe` checks each body, query or param, and Zod 4's built-in JSON Schema output (`z.toJSONSchema`) feeds Swagger through small decorators in `src/shared/openapi/` (`ApiZodBody`, `ApiZodResponse`, `ApiErrors`).

`nestjs-zod` was the first plan, but it doesn't support NestJS 12 yet, and Zod 4 makes it unnecessary.

## Options considered

- class-validator with class-transformer: the classic NestJS way, but each field needs decorators for validation and separate ones for Swagger, and the types are written twice.

## Consequences

- One schema gives validation, the TypeScript type and the docs.
- Schemas could later be shared with the mobile app.
