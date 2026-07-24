# Modo demostración — Distrisoft Web

El modo demo permite recorrer administración, operaciones (depósito, caja, reparto) y portal de comercios con datos ficticios **antes** de que la API comercial esté lista.

## Variables

```env
VITE_DATA_SOURCE=mock   # mock | api
VITE_DEMO_MODE=true     # true | false
```

| Modo   | Comportamiento                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| `mock` | Inicia MSW (solo fuera de producción), intercepta endpoints provisionales, persiste cambios en `localStorage`. |
| `api`  | No inicia MSW. Usa HTTP real. Si un endpoint falla, se muestra el error. **Sin fallback a mock.**              |

Producción recomendada:

```env
VITE_DATA_SOURCE=api
VITE_DEMO_MODE=false
```

## Cuentas demo (públicas, no son secretos)

Password común: `demo1234`

| Tipo                 | Correo                                  |
| -------------------- | --------------------------------------- |
| Administrador        | `admin@demo.distrisoft.local`           |
| Vendedor             | `ventas@demo.distrisoft.local`          |
| Preparador           | `deposito@demo.distrisoft.local`        |
| Cajero distribuidora | `caja@demo.distrisoft.local`            |
| Repartidor           | `reparto@demo.distrisoft.local`         |
| Dueño de comercio    | `comercio@demo.distrisoft.local`        |
| Comprador            | `compras@demo.distrisoft.local`         |
| Cajero de comercio   | `cajero.comercio@demo.distrisoft.local` |

La sesión demo vive en `sessionStorage` (`distrisoft-demo-session-v2`) y **no** usa JWT ni cookies productivas.

> La autorización definitiva será aplicada por Distrisoft API.
> La interfaz solo adapta navegación y acciones visibles.

## Persistencia

- Base demo: `localStorage` → `distrisoft-demo-db-v2`
- Carrito: `localStorage` → `distrisoft-demo-cart-v1`
- Sesión: `sessionStorage` → `distrisoft-demo-session-v2`

Payloads `v1` incompatibles se descartan de forma segura y se regeneran fixtures `v2`.

## Restablecer demostración

Usá el botón **Restablecer demostración** (layouts). Confirma, limpia datos modificados, restaura fixtures (usuarios, roles, pedidos, stock, preparaciones, recorridos, entregas, facturas, pagos, recibos, auditoría) e invalida queries.

## Qué es ficticio

Productos, comercios, pedidos, stock, logística, cuenta corriente, pagos, facturas/recibos demo, analytics derivados y autenticación demo. El banner **Modo demostración — Datos ficticios** permanece visible cuando `VITE_DEMO_MODE=true`.

Facturas y recibos llevan disclaimer explícito: **SIN VALIDEZ FISCAL / NO AUTORIZADO POR ARCA**.

## Feature flags demo

Flags locales en `src/app/config/feature-flags.ts` (`analytics`, `billing`, `cashier`, `warehouseOperations`, `deliveryOperations`). No ocultan fallos de autorización.

## Cómo eliminar MSW

1. `VITE_DATA_SOURCE=api` y `VITE_DEMO_MODE=false`
2. El worker no arranca en builds productivos (`shouldStartMockWorker`)
3. Cuando la API real exista, reemplazá handlers por endpoints reales sin cambiar la capa de features (hooks → api → httpClient)

## Dinero

Los importes se formatean y, en demo, se suman con helpers de centavos enteros. La API real será la fuente de verdad de totales, impuestos y saldos.
