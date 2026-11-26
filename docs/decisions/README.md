# Decisions

One short note per big choice: what we chose, what else we looked at, and why. Notes are numbered and never edited; a later note can replace an earlier one and says so at the top.

| #                                    | Decision                                    | Status   |
| ------------------------------------ | ------------------------------------------- | -------- |
| [0001](0001-prisma-schema-folder.md) | Prisma 7.10.1 with one model per file       | Accepted |
| [0002](0002-zod-validation.md)       | Zod for validation and Swagger              | Proposed |
| [0003](0003-error-shape.md)          | One error shape and error codes             | Accepted |
| [0004](0004-module-layout.md)        | Modules, feature folders and shared code    | Accepted |
| [0005](0005-generated-api-docs.md)   | Swagger and Postman generated from the code | Accepted |

## Template

```
# NNNN Title

Status: Proposed | Accepted | Replaced by NNNN
Date: YYYY-MM-DD

## Context
What problem or question this answers.

## Decision
What we chose.

## Options considered
What else we looked at, and why not.

## Consequences
What this makes easier, and what it costs.
```
