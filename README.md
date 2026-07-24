# Distrisoft Web

Frontend web de **Distrisoft**, la plataforma para administrar una distribuidora y permitir que sus comercios clientes operen online.

Este repositorio (`distrisoft-web`) es independiente de `distrisoft-api` y de la futura app móvil.

## Estado actual

Etapa 1 — base técnica:

- React + TypeScript + Vite
- React Router (áreas `/admin` y `/commerce`)
- TanStack Query
- Tailwind CSS
- Cliente HTTP tipado sobre `fetch`
- Validación de entorno con Zod
- Integración real con `GET /api/health`
- Layouts estructurales y páginas placeholder
- Vitest + Testing Library
- ESLint + Prettier
- Documentación de arquitectura

## Todavía no implementado

- Autenticación / sesiones / roles
- Clientes y usuarios
- Productos, categorías y listas de precios
- Stock
- Pedidos y carrito
- Cuenta corriente
- Pagos y comprobantes
- Reportes
- Generación de cliente desde OpenAPI

Las pantallas actuales son placeholders explícitos. No muestran datos de negocio inventados.

## Requisitos

- Node.js LTS
- npm

## Instalación

```powershell
npm install
copy .env.example .env
```

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

Ver `.env.example`. No versionar `.env`.

## Comandos

| Comando                | Descripción                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Servidor de desarrollo (puerto 5173) |
| `npm run build`        | Typecheck + build de producción      |
| `npm run typecheck`    | Verificación TypeScript              |
| `npm run lint`         | ESLint                               |
| `npm run test`         | Vitest (una corrida)                 |
| `npm run test:watch`   | Vitest en watch                      |
| `npm run format`       | Prettier write                       |
| `npm run format:check` | Prettier check                       |
| `npm run preview`      | Preview del build                    |

## Rutas disponibles

```text
/                      → /login
/login
/admin                 → /admin/dashboard
/admin/dashboard
/admin/customers
/admin/products
/admin/orders
/admin/inventory
/admin/payments
/commerce              → /commerce/catalog
/commerce/catalog
/commerce/cart
/commerce/orders
/commerce/account
/*                     → 404
```

## Integración con Distrisoft API

En desarrollo, el componente `ApiStatus` consulta:

```http
GET {VITE_API_URL}/health
```

Si la API está apagada, la UI muestra **API no disponible** y no bloquea la navegación estructural.

## Estructura general

```text
src/
  app/         providers, router, layouts, config, errors
  pages/       pantallas enrutadas
  shared/      api, components, lib
  styles/      Tailwind + tokens neutros
docs/
  architecture/
  development.md
```

## Documentación

- [Arquitectura](docs/architecture/overview.md)
- [Desarrollo](docs/development.md)
- [ADR 001 — React/Vite](docs/architecture/decisions/001-react-vite.md)
- [ADR 002 — Estructura por features](docs/architecture/decisions/002-feature-based-structure.md)
- [ADR 003 — TanStack Query](docs/architecture/decisions/003-server-state-tanstack-query.md)
