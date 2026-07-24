# Arquitectura — Distrisoft Web

## Capas

```text
router → page → feature (hooks/api) → httpClient → MSW (mock) | API (api)
```

| Carpeta     | Rol                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------- |
| `app/`      | Shell: providers, router, layouts, env, feature flags                                        |
| `pages/`    | Pantallas enrutadas (admin, commerce, operations)                                            |
| `features/` | Dominio: auth, products, orders, inventory, accounts, payments, billing, analytics, delivery |
| `shared/`   | HTTP, UI base, money/decimal, tipos provisionales                                            |
| `mocks/`    | Fixtures + handlers MSW (solo demo)                                                          |

Áreas de layout: `admin`, `commerce`, `operations/warehouse|cashier|delivery`.

## Estado

- **Servidor:** TanStack Query
- **Carrito (demo):** Zustand + persist local (`distrisoft-demo-cart-v1`)
- **Sesión demo:** `sessionStorage` (`distrisoft-demo-session-v2`, sin JWT)
- **Base demo:** `localStorage` (`distrisoft-demo-db-v2`)

## Autorización demo (UX only)

Roles y permisos centralizados en `features/auth/permissions.ts`. Guards de ruta y componente `Can` adaptan la UI.

**La autorización definitiva será aplicada por Distrisoft API.** La interfaz solo adapta navegación y acciones visibles.

Ver [roles-and-permissions.md](../roles-and-permissions.md) y [ADR 005](decisions/005-demo-rbac.md).

## Modo demo

Ver [demo-mode.md](../demo-mode.md) y [ADR 004](decisions/004-msw-demo-mode.md).

Las páginas **no** importan fixtures. Solo consumen hooks de features.

## OpenAPI futuro

Cuando el contrato real exista, se generarán tipos/clientes. Los endpoints mock actuales están marcados como **PROVISIONAL**.
