# Arquitectura — Distrisoft Web

## Qué es esta aplicación

`distrisoft-web` es el frontend web de Distrisoft. En un mismo proyecto React conviven dos áreas de navegación:

- `/admin/*` — panel operativo de la distribuidora.
- `/commerce/*` — portal para comercios clientes.

Ambas áreas consumirán la misma API (`distrisoft-api`). La API es la fuente de verdad para precios, stock, permisos, saldos y estados de pedidos.

## Capas de la aplicación

```text
router → page → (feature futura) → shared/api → Distrisoft API
```

| Capa        | Responsabilidad                                                           |
| ----------- | ------------------------------------------------------------------------- |
| `app/`      | Arranque, providers, router, layouts, configuración y errores globales.   |
| `pages/`    | Pantallas enrutadas. En esta etapa son placeholders estructurales.        |
| `features/` | Todavía no existe. Se creará por dominio cuando haya casos de uso reales. |
| `shared/`   | Utilidades transversales: cliente HTTP, componentes base, helpers.        |

### Por qué admin y commerce no son features

`admin` y `commerce` representan **áreas de producto / shells de navegación**, no capacidades de negocio.

Una feature es un dominio (productos, pedidos, pagos). Esas capacidades pueden aparecer tanto en admin como en commerce con componentes y hooks distintos, pero compartiendo contratos de API.

Por eso los layouts viven en `app/layouts/` y las pantallas actuales en `pages/admin` y `pages/commerce`.

### Cómo se incorporarán features reales

Cuando exista un circuito real, por ejemplo catálogo:

```text
src/features/catalog/
  api/
  components/
  hooks/
  schemas/
  types/
  index.ts
```

Las páginas en `pages/` quedarán delgadas: compondrán UI de la feature y conectarán hooks de TanStack Query.

## Estado

- **Estado de servidor:** TanStack Query (`shared/api` + hooks de feature).
- **Estado visual local:** React (`useState` / UI local en layouts y páginas).
- **Estado global de cliente:** no se usa todavía. Zustand se evaluará solo si aparece una necesidad concreta (por ejemplo carrito).

No se duplican respuestas de API en un store global paralelo.

## Comunicación con la API

La capa `shared/api` concentra el acceso HTTP:

- URL base desde `VITE_API_URL`.
- `credentials: "include"` para cookies HttpOnly futuras.
- Errores tipados (`HttpError`).
- Soporte de `AbortSignal` y respuestas sin cuerpo (`204`).

Hoy solo existe integración real con `GET /api/health`.

Cuando el contrato OpenAPI de la API esté estable, se generarán tipos y clientes a partir de ese contrato. Los wrappers actuales están pensados para no pelearse con esa transición.

## Seguridad (etapa actual)

- No hay autenticación implementada.
- No hay tokens en `localStorage`.
- No hay guards con roles hardcodeados.
- El frontend nunca reemplaza la autorización de la API.

## Dinero

`formatMoney` solo formatea strings decimales para visualización. Los cálculos financieros críticos permanecen en la API.

## Estado actual del frontend

Implementado:

- Base Vite + React + TypeScript.
- Routing y layouts.
- Cliente HTTP.
- Health check de desarrollo.
- Tooling de calidad y documentación.

No implementado todavía:

- Autenticación y sesiones.
- Clientes, productos, stock, pedidos, cuenta corriente, pagos.
- Generación OpenAPI.
- App móvil.
