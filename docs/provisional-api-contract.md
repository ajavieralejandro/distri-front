# Contrato API provisional (demo)

Todos los endpoints siguientes son:

**PROVISIONAL — pendiente de validación con Distrisoft API**

Base: `{VITE_API_URL}` (ej. `http://localhost:3000/api`)

## Auth demo

| Método | Ruta                 | Notas                             |
| ------ | -------------------- | --------------------------------- |
| POST   | `/auth/demo/login`   | Credenciales demo → `DemoSession` |
| POST   | `/auth/demo/logout`  | 204                               |
| GET    | `/auth/demo/session` | Lookup opcional por `userId`      |

## Catálogo

| Método | Ruta            |
| ------ | --------------- |
| GET    | `/categories`   |
| GET    | `/products`     |
| GET    | `/products/:id` |

## Clientes

| Método | Ruta             |
| ------ | ---------------- |
| GET    | `/customers`     |
| GET    | `/customers/:id` |

## Pedidos

| Método | Ruta                 |
| ------ | -------------------- |
| GET    | `/orders`            |
| GET    | `/orders/:id`        |
| POST   | `/orders`            |
| PATCH  | `/orders/:id/status` |

## Inventario

| Método | Ruta                |
| ------ | ------------------- |
| GET    | `/inventory`        |
| POST   | `/inventory/adjust` |

## Cuenta y pagos

| Método | Ruta                              |
| ------ | --------------------------------- |
| GET    | `/accounts/:commerceId/summary`   |
| GET    | `/accounts/:commerceId/movements` |
| GET    | `/payments`                       |
| POST   | `/payments`                       |

## Admin

| Método | Ruta               |
| ------ | ------------------ |
| GET    | `/admin/dashboard` |

## Salud (API real)

| Método | Ruta      |
| ------ | --------- |
| GET    | `/health` | No mockeado; en modo `api` usa el backend real. |

No tratar este documento como OpenAPI definitivo.
