# Authorization — provisional decisions

## Critical rule

> La autorización definitiva será aplicada por Distrisoft API.
> La interfaz solo adapta navegación y acciones visibles.

Demo RBAC (`hasPermission`, `Can`, route guards) is **UX-only**. MSW does not check roles.

## Provisional API approach

1. Authenticate via Bearer token.
2. Resolve caller role + scopes (`distributorId`, `commerceId`, `warehouseId`, `assignedRouteId`).
3. Enforce permissions server-side (catalog similar to `Permission` in `src/shared/types/demo.ts`).
4. Document intended roles per operation with `x-allowed-roles` (non-binding extension).

## OPEN QUESTIONS

1. Permission catalog stored in DB vs code constants?
   - **Recommendation:** code constants for v1; admin UI later.
2. Fine-grained ABAC beyond role+scope?
   - Defer until real customer requirements appear.
3. How to expose `/me/permissions` — flat list vs tree?
   - **Recommendation:** flat string list matching demo permission ids.
