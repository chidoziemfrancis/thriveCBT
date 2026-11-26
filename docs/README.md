# ThriveCBT backend docs

Everything about the NestJS API in the repo root. The student app has its own docs in `mobile/docs/`.

| Where                              | What                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| [backend-plan.md](backend-plan.md) | The full plan: stack, folder layout, conventions, phases B0–B7                        |
| [backend-todo.md](backend-todo.md) | Checklist of every task, phase by phase                                               |
| [api/](api/README.md)              | How the API is documented: Swagger, the OpenAPI file, and the data contract (B1)      |
| [postman/](../postman/README.md)   | Postman collection and environments (at the repo root), generated from the code       |
| [decisions/](decisions/)           | One short note per big choice, so the reasons are never lost                          |
| [runbooks/](runbooks/)             | Step-by-step guides: local setup now; backups, key rotation and alert outages from B7 |

## Keeping docs honest

- Swagger and the Postman collection are **generated from the code**, never edited by hand. If they disagree with the code, the generator is wrong, not the docs.
- Every PR that adds or changes an endpoint regenerates them. CI fails if the committed files are out of date.
- A new big choice gets a new numbered note in `decisions/`. Old notes are never edited; a later note replaces them and says so.
