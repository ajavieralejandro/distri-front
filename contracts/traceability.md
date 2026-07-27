# Traceability — frontend demo → contract

Status values: `DEMO_ONLY` | `CONTRACT_PROVISIONAL` | `BACKEND_PENDING` | `READY_FOR_IMPLEMENTATION`

Nothing is implemented in a real backend yet.

| Frontend / feature            | MSW handler                     | OpenAPI operationId      | Postman area      | Roles (UX)           | Status               |
| ----------------------------- | ------------------------------- | ------------------------ | ----------------- | -------------------- | -------------------- |
| ApiStatus                     | (none)                          | getHealth                | 00 System         | public               | CONTRACT_PROVISIONAL |
| LoginPage                     | POST /auth/demo/login           | login                    | 01 Authentication | public               | CONTRACT_PROVISIONAL |
| logout                        | POST /auth/demo/logout          | logout                   | 01 Authentication | authenticated        | CONTRACT_PROVISIONAL |
| (future)                      | —                               | refresh                  | 01 Authentication | public               | BACKEND_PENDING      |
| session local                 | GET /auth/demo/session (unused) | getCurrentUser (auth/me) | 02 Current user   | authenticated        | CONTRACT_PROVISIONAL |
| permissions.ts                | —                               | getMyPermissions         | 02 Current user   | authenticated        | CONTRACT_PROVISIONAL |
| session scopes                | —                               | getMyContexts            | 02 Current user   | authenticated        | CONTRACT_PROVISIONAL |
| CustomersPage                 | GET /customers                  | listCustomers            | 03 Customers      | admin/sales/cashier  | CONTRACT_PROVISIONAL |
| CustomerDetail                | GET /customers/:id              | getCustomer              | 03 Customers      | admin/sales/cashier  | CONTRACT_PROVISIONAL |
| Catalog/Products              | GET /products                   | listProducts             | 04 Products       | many                 | CONTRACT_PROVISIONAL |
| Product detail                | GET /products/:id               | getProduct               | 04 Products       | many                 | CONTRACT_PROVISIONAL |
| Catalog filters               | GET /categories                 | listCategories           | 04 Products       | many                 | CONTRACT_PROVISIONAL |
| Orders pages                  | GET /orders                     | listOrders               | 05 Orders         | many                 | CONTRACT_PROVISIONAL |
| Order detail                  | GET /orders/:id                 | getOrder                 | 05 Orders         | many                 | CONTRACT_PROVISIONAL |
| Cart → create                 | POST /orders                    | createOrder              | 05 Orders         | sales/commerce       | CONTRACT_PROVISIONAL |
| Admin status                  | PATCH /orders/:id/status        | updateOrderStatus        | 05 Orders         | admin/sales          | CONTRACT_PROVISIONAL |
| Warehouse prepare             | PATCH .../prepare-items         | prepareOrderItems        | 06 Warehouse      | picker               | CONTRACT_PROVISIONAL |
| Warehouse ready               | POST .../ready-for-dispatch     | readyOrderForDispatch    | 06 Warehouse      | picker               | CONTRACT_PROVISIONAL |
| Delivery result               | PATCH .../delivery              | reportOrderDelivery      | 07 Delivery       | driver               | CONTRACT_PROVISIONAL |
| Delivery routes               | GET /delivery/routes            | listDeliveryRoutes       | 07 Delivery       | driver/admin         | CONTRACT_PROVISIONAL |
| Route detail                  | GET /delivery/routes/:id        | getDeliveryRoute         | 07 Delivery       | driver/admin         | CONTRACT_PROVISIONAL |
| Start route                   | POST .../start                  | startDeliveryRoute       | 07 Delivery       | driver               | CONTRACT_PROVISIONAL |
| Inventory                     | GET /inventory                  | listInventory            | admin/picker      | CONTRACT_PROVISIONAL |
| Adjust stock                  | POST /inventory/adjust          | adjustInventory          | admin             | CONTRACT_PROVISIONAL |
| Account                       | GET /accounts/:id/summary       | getAccountSummary        | 08 Accounts       | cashier/owner        | CONTRACT_PROVISIONAL |
| Movements                     | GET /accounts/:id/movements     | listAccountMovements     | 08 Accounts       | cashier/owner        | CONTRACT_PROVISIONAL |
| Payments                      | GET/POST /payments              | list/createPayment       | 08 Accounts       | cashier/owner        | CONTRACT_PROVISIONAL |
| Billing UI                    | GET/POST /invoices*             | invoice ops              | 09 Billing        | admin/owner          | CONTRACT_PROVISIONAL |
| Receipt (payment side-effect) | (no GET in MSW)                 | list/getReceipt          | 09 Billing        | cashier              | CONTRACT_PROVISIONAL |
| Analytics pages               | GET /analytics/*                | analytics ops            | 10 Analytics      | admin/owner          | CONTRACT_PROVISIONAL |
| Admin dashboard               | GET /admin/dashboard            | getAdminDashboard        | 10 Analytics      | admin/sales          | CONTRACT_PROVISIONAL |
| Users page                    | GET /users                      | listUsers                | 11 Audit          | admin/owner          | CONTRACT_PROVISIONAL |
| Audit page                    | GET /audit                      | listAuditEvents          | 11 Audit          | admin                | CONTRACT_PROVISIONAL |
| Cart zustand                  | —                               | —                        | —                 | commerce             | DEMO_ONLY            |
| Branches/warehouses CRUD      | fixtures only                   | —                        | —                 | —                    | DEMO_ONLY            |
| Negative Postman folder       | —                               | —                        | 90 Negative tests | —                    | BACKEND_PENDING      |

## Mapping notes

- Demo auth paths `/auth/demo/*` map to provisional `/auth/*`.
- Docs historically mentioned `/audit-events` and `/delivery/orders/:id/result`; contract follows **code**: `/audit` and `PATCH /orders/{id}/delivery`.
- Money and pagination shapes differ from MSW (see decisions/).
