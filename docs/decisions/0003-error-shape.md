# 0003 One error shape and error codes

Status: Accepted; where codes live is replaced by 0006
Date: 2026-11-26

## Context

The app needs to react to errors reliably (show a message, ask to log in again, retry later) without reading English text.

## Decision

- Every error response is `{ "error": { "code", "message", "details?", "requestId" } }`.
- `code` is a stable UPPER_SNAKE string. Shared codes live in `src/shared/errors/error-codes.ts`; feature codes in `<feature>.errors.ts`.
- Our code throws only `AppError`. One global filter maps everything else (validation, NestJS, Prisma, unknown) into the shape.
- Unknown errors return 500 `INTERNAL` with a generic message; the stack is logged, never returned.
- Every response carries `x-request-id`, which also appears in logs.

## Consequences

- The app switches on `code`, so wording can change freely.
- New codes must be documented in Swagger with the endpoint that returns them.
