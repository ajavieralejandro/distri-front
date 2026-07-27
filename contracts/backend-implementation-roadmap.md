# Backend implementation roadmap (Spring Boot)

Do **not** treat this as implemented work. Guide for a future `distri-api` repository.

## 1. Create `distri-api`

- Empty Spring Boot 3.x repo (Java 21).
- Module layout: `api`, `domain`, `infrastructure`, `bootstrap`.

## 2. Skeleton

- Spring Web, Validation, Actuator (`/health` aligned with contract).
- OpenAPI via springdoc **or** contract-first codegen from `contracts/openapi`.

## 3. PostgreSQL

- Single database, shared schema.
- `distributor_id` on tenant-owned tables (see multitenancy decision).

## 4. Migrations

- Flyway/Liquibase from day one.
- Seed only synthetic demo data in non-prod profiles.

## 5. Multitenancy

- Resolve tenant from authenticated principal.
- Enforce scope on every query (commerce/warehouse/route).

## 6. Security

- Replace demo login with real auth (OQ-01/OQ-02).
- Method security / filter chain mapping `x-allowed-roles` + permission catalog.
- Never trust UI-hidden routes.

## 7. OpenAPI discipline

- CI: `api:lint` + diff bundled contract.
- Fail build if controllers drift from operations marked `READY_FOR_IMPLEMENTATION`.

## 8. First vertical (recommended)

1. `GET /health`
2. `POST /auth/login` + `GET /auth/me`
3. `GET /customers`, `GET /products`
4. `POST /orders` + status confirm
5. Warehouse prepare + ready-for-dispatch

## 9. Internal tests

- Unit: transitions, money, idempotency store.
- Slice/integration: Postgres Testcontainers.

## 10. Postman in CI

- Newman against ephemeral environment.
- Run positive folder first; enable negatives when authz exists.
- Mark collection execution as real only after backend exists.

## 11. Staging

- Deploy API + migrate.
- Point web `VITE_DATA_SOURCE=api` without MSW fallback.

## 12. Gradual MSW retirement

- Feature-by-feature: when an operation is stable, remove corresponding MSW handler.
- Keep contract version bumps explicit.

## Stability criteria (per operation)

An operation may leave `provisional` only when:

1. Implemented behind authz + tenant checks.
2. Has integration tests.
3. Error schema matches contract.
4. Postman positive + relevant negatives pass in CI.
5. Documented changelog entry and version bump.
6. Frontend consumes generated/typed client (or validated manually) without MSW for that path.
