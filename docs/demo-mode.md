# Modo demostración — Distrisoft Web

El modo demo permite recorrer `/admin/*` y `/commerce/*` con datos ficticios **antes** de que la API comercial esté lista.

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

| Rol           | Correo                           | Contraseña |
| ------------- | -------------------------------- | ---------- |
| Administrador | `admin@demo.distrisoft.local`    | `demo1234` |
| Comercio      | `comercio@demo.distrisoft.local` | `demo1234` |

La sesión demo vive en `sessionStorage` (`distrisoft-demo-session-v1`) y **no** usa JWT ni cookies productivas.

## Persistencia

- Base demo: `localStorage` → `distrisoft-demo-db-v1`
- Carrito: `localStorage` → `distrisoft-demo-cart-v1`
- Sesión: `sessionStorage` → `distrisoft-demo-session-v1`

## Restablecer demostración

Usá el botón **Restablecer demostración** (layouts). Confirma, limpia datos modificados, restaura fixtures e invalida queries.

## Qué es ficticio

Productos, comercios, pedidos, stock, cuenta corriente, pagos y autenticación demo. El banner **Modo demostración — Datos ficticios** permanece visible cuando `VITE_DEMO_MODE=true`.

## Cómo eliminar MSW

1. `VITE_DATA_SOURCE=api` y `VITE_DEMO_MODE=false`
2. El worker no arranca en builds productivos (`shouldStartMockWorker`)
3. Cuando la API real exista, reemplazá handlers por endpoints reales sin cambiar la capa de features (hooks → api → httpClient)

## Dinero

Los importes se formatean y, en demo, se suman con helpers de centavos enteros. La API real será la fuente de verdad de totales, impuestos y saldos.
