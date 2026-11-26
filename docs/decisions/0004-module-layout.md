# 0004 Modules, feature folders and shared code

Status: Accepted; file layout and shared code replaced by 0006
Date: 2026-11-26

## Decision

- Code is grouped by module (`src/modules/<module>/`), not by technical layer.
- A module with one feature is flat. With two or more features, each gets a folder and the module file only imports them.
- Every feature has the same files: controller (HTTP only), service (rules), repository (the only Prisma access), `dto/`, errors, tests.
- Shared code sits at the lowest level all its users reach: feature folder, then `modules/<module>/shared/`, then `src/shared/`. `src/shared/` never imports from modules and holds no study rules.
- Features never use another feature's repository; they call its service or listen to its event (`src/events/`).
- Outside services sit behind wrappers in `src/integrations/`; scheduled work lives in `src/jobs/`.
- Prisma schema folders mirror the module folders.

## Consequences

- Anyone can find a feature's code in one place, and every feature reads the same way.
- Moving a feature or splitting a module is a folder move.
