# Roles y permisos (demo)

> La autorización definitiva será aplicada por Distrisoft API.
> La interfaz solo adapta navegación y acciones visibles.

## Roles

| Rol               | Área principal                             |
| ----------------- | ------------------------------------------ |
| DISTRIBUTOR_ADMIN | `/admin`                                   |
| SALES             | `/admin` (sin inventario/caja/facturación) |
| WAREHOUSE_PICKER  | `/operations/warehouse`                    |
| CASHIER           | `/operations/cashier`                      |
| DRIVER            | `/operations/delivery`                     |
| COMMERCE_OWNER    | `/commerce` completo                       |
| COMMERCE_BUYER    | catálogo y pedidos                         |
| COMMERCE_CASHIER  | pedidos de sucursal                        |

## Permisos

Catálogo central en `src/features/auth/permissions.ts` (`hasPermission`).

No dispersar `session.role === ...` en páginas: usar `Can` / `hasPermission`.

## Alcance

- `canAccessCommerce(session, commerceId)`
- `canAccessWarehouse(session, warehouseId)`
- `canAccessDelivery(session, routeId)`

RBAC define _qué_ puede hacer el rol; el alcance define _sobre qué recursos_.

## Mobile (propuesta, sin implementar)

| Roles                             | Canal              |
| --------------------------------- | ------------------ |
| COMMERCE_*                        | App Expo comercio  |
| WAREHOUSE_PICKER                  | Expo depósito      |
| DRIVER                            | Expo reparto       |
| DISTRIBUTOR_ADMIN, SALES, CASHIER | Principalmente web |
