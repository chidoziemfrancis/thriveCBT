# 0006 Role folders, root-level shared code, global error codes

Status: Accepted (replaces the file layout in 0004 and where error codes live in 0003)
Date: 2026-11-27

## Context

With every feature's files side by side in one folder, controllers, services, repositories, error codes and tests mix together and are harder to scan. Module-level `shared/` folders and per-feature error files also scatter code that belongs in one place.

## Decision

- Inside a feature, files are grouped by role: `controllers/`, `services/`, `repositories/`, `dto/`, `tests/`.
- A module with one feature has those folders directly; a module with two or more features has one folder per feature, each with its own role folders.
- Anything used by more than one feature or module goes in `src/shared/`. Modules have no `shared/` folders.
- Error handling is global: `AppError`, the filter and every error code live in `src/shared/errors/`. Common codes are in `error-codes.ts`; each module's codes are one file in `src/shared/errors/codes/<module>.errors.ts`.

## Consequences

- Every module reads the same way, and all error codes can be reviewed in one folder.
- Imports from a feature to shared code are a little longer (`../../../shared/...`).
