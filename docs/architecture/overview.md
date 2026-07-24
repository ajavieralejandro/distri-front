# Arquitectura — Distrisoft Web

## Capas

```text
router → page → feature (hooks/api) → httpClient → MSW (mock) | API (api)
```

| Carpeta     | Rol                                                            |
| ----------- | -------------------------------------------------------------- |
| `app/`      | Shell: providers, router, layouts, env                         |
| `pages/`    | Pantallas enrutadas (delgadas)                                 |
| `features/` | Dominio: auth, products, orders, inventory, accounts, payments |
| `shared/`   | HTTP, UI base, money/decimal, tipos                            |
| `mocks/`    | Fixtures + handlers MSW (solo demo)                            |

`admin` y `commerce` son **layouts/áreas**, no features.

## Estado

- **Servidor:** TanStack Query
- **Carrito (demo):** Zustand + persist local (`distrisoft-demo-cart-v1`)
- **Sesión demo:** `sessionStorage` (estructura `DemoSession`, sin JWT)

## Modo demo

Ver [demo-mode.md](../demo-mode.md) y [ADR 004](decisions/004-msw-demo-mode.md).

Las páginas **no** importan fixtures. Solo consumen hooks de features.

## OpenAPI futuro

Cuando el contrato real exista, se generarán tipos/clientes. Los endpoints mock actuales están marcados como **PROVISIONAL**.
