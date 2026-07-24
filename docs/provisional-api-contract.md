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

## Pedidos y preparación

| Método | Ruta                             |
| ------ | -------------------------------- |
| GET    | `/orders`                        |
| GET    | `/orders/:id`                    |
| POST   | `/orders`                        |
| PATCH  | `/orders/:id/status`             |
| PATCH  | `/orders/:id/prepare-items`      |
| POST   | `/orders/:id/ready-for-dispatch` |

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
| POST   | `/payments`                       | Idempotencia vía `clientOperationId` |

## Facturación y recibos demo

| Método | Ruta                   | Notas                         |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/invoices`            | Disclaimer sin validez fiscal |
| POST   | `/invoices`            | Solo pedidos `DELIVERED`      |
| POST   | `/invoices/:id/issue`  | Emisión demostrativa          |
| POST   | `/invoices/:id/cancel` | Cancelación demostrativa      |
| GET    | `/receipts`            | Generados al registrar pagos  |
| GET    | `/receipts/:id`        |                               |

## Reparto

| Método | Ruta                          |
| ------ | ----------------------------- |
| GET    | `/delivery/routes`            |
| GET    | `/delivery/routes/:id`        |
| POST   | `/delivery/routes/:id/start`  |
| POST   | `/delivery/orders/:id/result` |

## Analytics

| Método | Ruta                  |
| ------ | --------------------- |
| GET    | `/analytics/admin`    |
| GET    | `/analytics/commerce` |

Derivados de fixtures/estado mock. Sustituibles por endpoints analíticos reales.

## Usuarios y auditoría demo

| Método | Ruta            |
| ------ | --------------- |
| GET    | `/users`        |
| GET    | `/audit-events` |

## Admin

| Método | Ruta               |
| ------ | ------------------ |
| GET    | `/admin/dashboard` |

## Salud (API real)

| Método | Ruta      |
| ------ | --------- |
| GET    | `/health` | No mockeado; en modo `api` usa el backend real. |

No tratar este documento como OpenAPI definitivo.
