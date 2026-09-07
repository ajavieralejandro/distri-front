# Roles y permisos (demo)

> La autorización definitiva será aplicada por Distrisoft API.
> La interfaz solo adapta navegación y acciones visibles.

## Perfil canónico (decisión de producto, 2026-09-07)

Distrisoft expone hoy **dos perfiles**: `ADMIN` y `COMMERCE`. Los 8 `DemoRole`
de abajo se mantienen para permisos finos y áreas operativas (`/operations/*`),
pero nunca se muestran como identidad propia — todo se resuelve al perfil
canónico vía `getAppProfile()` en
[`src/features/auth/app-profile.ts`](../src/features/auth/app-profile.ts):

| DemoRole | Perfil canónico |
| --- | --- |
| DISTRIBUTOR_ADMIN, SALES, WAREHOUSE_PICKER, CASHIER, DRIVER | ADMIN |
| COMMERCE_OWNER, COMMERCE_BUYER, COMMERCE_CASHIER | COMMERCE |

El login solo ofrece `DISTRIBUTOR_ADMIN` ("Administrador") y `COMMERCE_OWNER`
("Comercio") — ver `login-profiles.ts`. Los headers de `AdminLayout` y
`CommerceLayout` muestran el label del perfil canónico
(`getAppProfileLabel`), no el `DemoRole` granular.

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
