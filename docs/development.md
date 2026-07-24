# Desarrollo — Distrisoft Web

## Requisitos

- Node.js LTS
- npm 10+

## Instalación

```powershell
cd C:\Users\Usuario\Desktop\Javi\distrisoft\web
npm install
copy .env.example .env
```

## Variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_DATA_SOURCE=mock
VITE_DEMO_MODE=true
# VITE_ROUTER_MODE=browser
```

- `VITE_DATA_SOURCE=mock|api`
- `VITE_DEMO_MODE=true|false`
- `VITE_ROUTER_MODE=browser|hash` (opcional; se infiere desde Vite `base`)
- Sin secretos en `VITE_*`
- API productiva: `api` + `DEMO_MODE=false` (MSW no arranca)

Ver [modo demo](demo-mode.md) y [GitHub Pages](deployment-github-pages.md).

## Ejecución

```powershell
npm run dev
```

MSW usa `import.meta.env.BASE_URL + mockServiceWorker.js` cuando `VITE_DATA_SOURCE=mock` y `VITE_DEMO_MODE=true` (también en builds Pages).

## Calidad

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run build:pages
```

## Áreas demo

- Admin: `/admin/*`
- Depósito: `/operations/warehouse/*`
- Caja: `/operations/cashier/*`
- Reparto: `/operations/delivery/*`
- Comercio: `/commerce/*`

Ver [roles-and-permissions.md](roles-and-permissions.md) y [operations.md](operations.md).

## API vs mock

|             | mock                                      | api           |
| ----------- | ----------------------------------------- | ------------- |
| MSW         | Sí si `demoMode=true` (dev, test o Pages) | No            |
| Health real | No requerido                              | `GET /health` |
| Fallback    | Nunca                                     | Nunca         |

## CORS / API apagada

En modo `api`, si el backend no responde, la UI muestra error (no datos ficticios). En modo `mock`, el backend no es necesario.
