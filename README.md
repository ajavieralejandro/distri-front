# Distrisoft Web

Frontend web de **Distrisoft** (panel admin + portal de comercios).

## Estado actual

Base técnica + **modo demostración controlado** (MSW):

- Login demo (sin JWT)
- Catálogo, carrito, pedidos, inventario, cuenta corriente y pagos simulados
- Banner permanente de datos ficticios
- Features por dominio (`src/features/*`)
- Tests Vitest + MSW

La API comercial real **todavía no** está integrada. Los contratos mock son **provisionales**.

## Requisitos

- Node.js LTS + npm

## Instalación (demo)

```powershell
cd C:\Users\Usuario\Desktop\Javi\distrisoft\web
npm install
copy .env.example .env
npm run dev
```

Abrí `http://localhost:5173`.

### Cuentas demo

| Rol      | Correo                           | Contraseña |
| -------- | -------------------------------- | ---------- |
| Admin    | `admin@demo.distrisoft.local`    | `demo1234` |
| Comercio | `comercio@demo.distrisoft.local` | `demo1234` |

Restablecer: botón **Restablecer demostración**.

## Variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_DATA_SOURCE=mock
VITE_DEMO_MODE=true
```

Modo API real (sin mocks, sin fallback):

```env
VITE_DATA_SOURCE=api
VITE_DEMO_MODE=false
```

## Comandos

`npm run dev` · `npm run test` · `npm run lint` · `npm run typecheck` · `npm run build`

## Documentación

- [Modo demo](docs/demo-mode.md)
- [Contrato provisional](docs/provisional-api-contract.md)
- [Arquitectura](docs/architecture/overview.md)
- [Desarrollo](docs/development.md)
- [ADR 004 — MSW](docs/architecture/decisions/004-msw-demo-mode.md)
