# API documentation

Three views of the same API, all coming from the code.

| View               | Where                                                     | Use it to                                                 |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| Swagger page       | `http://localhost:3000/v1/docs` when the API runs locally | Read every endpoint and try it in the browser             |
| OpenAPI file       | [openapi.json](openapi.json), generated (from B0)         | Review API changes in pull requests; import into any tool |
| Postman collection | [postman/](../../postman/README.md)                       | Call the API from Postman with saved logins               |

## How it's generated

- Request and response shapes are Zod schemas in each feature's `dto/` folder. The same schemas validate requests and describe them in Swagger, so the docs can't say one thing while the code does another.
- Every controller is tagged with its module, so Swagger groups endpoints the same way as the folders.
- Every endpoint documents its success response and its error responses. All errors use the shared shape:

  ```json
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "…",
      "details": {},
      "requestId": "…"
    }
  }
  ```

- `npm run docs:openapi` writes `openapi.json` without a running server or database.
- Swagger is on locally and on staging, and off in production.

## Data contract (B1)

Phase B1 adds one page per module here: models, fields, endpoints, requests, responses, error codes and who can see what. That's the document the team signs off before building B2 onwards.
