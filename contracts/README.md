# Distrisoft API contracts

Provisional, versioned, executable API contract derived from the web demo.

```text
OpenAPI → examples → Postman → future Spring Boot → real frontend
```

**Status:** `0.1.0-provisional` — nothing here is stable.

## Layout

```text
contracts/
├── openapi/           # OpenAPI 3.1 (modular)
├── postman/           # Collection + environments
├── decisions/         # Cross-cutting decisions & open questions
├── traceability.md    # Frontend → MSW → OpenAPI → Postman
└── backend-implementation-roadmap.md
```

## Commands

```powershell
npm run api:lint
npm run api:bundle
npm run api:mock
npm run postman:generate
npm run postman:validate
```

Mock (temporary):

```powershell
npx @stoplight/prism-cli mock contracts/openapi/distrisoft-api.yaml --port 4010
```

> An OpenAPI mock validates shapes and examples. It does **not** prove business rules, persistence, real authorization, or multi-tenant isolation.

## Environments

| Name            | baseUrl                                   |
| --------------- | ----------------------------------------- |
| local           | `http://localhost:8080/api`               |
| mock            | `http://localhost:4010/api`               |
| staging.example | `https://api-staging.example.invalid/api` |

## Security note

UI roles adapt UX only. Definitive authorization belongs to Distrisoft API.
