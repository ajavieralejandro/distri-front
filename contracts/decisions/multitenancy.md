# Multitenancy — provisional decisions

## Observed in demo

`DemoSession` may include `distributorId`, `commerceId`, `branchId`, `warehouseId`, `assignedRouteId`.
MSW handlers do **not** enforce tenant isolation; clients pass filters like `commerceId`.

## Provisional model

- Tenant root: **distributor** (`distributorId`).
- Sub-scopes: commerce, branch, warehouse, delivery route.
- List endpoints should default to the caller's allowed scope.

## OPEN QUESTIONS

1. Single-database shared schema with `distributor_id` column vs schema-per-tenant?
   - **Recommendation:** shared schema + `distributor_id` on all tenant-owned tables for v1.
2. Cross-distributor admin (platform operator)? Not in demo — defer.
3. Resource belonging to another tenant: **403** vs **404**?
   - **Recommendation:** **404** to avoid resource enumeration (document as provisional).
