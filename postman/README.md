# Postman

The collection is generated from the API's OpenAPI file. Don't edit it in Postman and export it back; change the code and regenerate.

## Files

| File                                            | What                                                      |
| ----------------------------------------------- | --------------------------------------------------------- |
| `thrivecbt.postman_collection.json`             | Every endpoint, one folder per module (generated from B0) |
| `environments/local.postman_environment.json`   | Local address and empty token variables                   |
| `environments/staging.postman_environment.json` | Added once staging exists                                 |

## Use it

1. In Postman: **Import** the collection and the local environment.
2. Pick the **ThriveCBT local** environment (top right).
3. Start the API locally (`npm run start:dev`).
4. From B2: run **auth → Login**. Its test script saves `accessToken` and `refreshToken` into the environment.
5. Run any other request; they all send `Authorization: Bearer {{accessToken}}`.

## Regenerate

```bash
npm run docs           # OpenAPI file, then the Postman collection
```

CI fails if the committed collection is out of date.

## Rules

- Environment files hold addresses and empty variables only. Never commit real tokens, passwords or student data.
- Use seeded test accounts (`npm run db:seed`) when calling the API locally.
