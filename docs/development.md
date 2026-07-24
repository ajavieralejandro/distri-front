# Desarrollo — Distrisoft Web

## Requisitos

- Node.js LTS (verificado con v22.x)
- npm 10+
- API local opcional en `http://localhost:3000/api` para el health check

## Instalación

```powershell
cd C:\Users\Usuario\Desktop\Javi\distrisoft\web
npm install
copy .env.example .env
```

## Variables de entorno

Archivo de referencia: `.env.example`

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

Valores permitidos de `VITE_APP_ENV`:

- `development`
- `staging`
- `production`
- `test`

Notas:

- Las variables `VITE_*` quedan expuestas en el bundle. No colocar secretos ahí.
- `.env` no se versiona.
- Si falta una variable obligatoria o es inválida, la app falla al iniciar con un mensaje explícito.

## Ejecución

```powershell
npm run dev
```

Vite escucha en `http://localhost:5173`.

## Calidad

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Comandos útiles adicionales:

```powershell
npm run format
npm run test:watch
npm run preview
```

## Relación con la API

| Frontend                                 | API                          |
| ---------------------------------------- | ---------------------------- |
| `VITE_API_URL`                           | Prefijo global `/api`        |
| `GET /health` (cliente)                  | `GET /api/health`            |
| cookies futuras (`credentials: include`) | CORS con `credentials: true` |

### API apagada

No es un fallo del frontend. En desarrollo, `ApiStatus` mostrará **API no disponible** y la navegación estructural seguirá funcionando.

### CORS

Si el navegador bloquea el health check:

1. Confirmar que la API está arriba.
2. Verificar `CORS_ORIGIN` en la API (en desarrollo puede ser `*`, pero con cookies reales convendrá origen explícito).
3. Confirmar que el frontend llama a `http://localhost:3000/api/...` y no a una ruta relativa incorrecta.

## Estructura relevante

```text
src/app         shell técnico
src/pages       rutas / placeholders
src/shared      HTTP, UI base, utilidades
docs/           arquitectura y ADRs
```

## Próximas etapas (no implementadas)

1. Autenticación real con cookies HttpOnly.
2. Catálogo y productos.
3. Carrito y pedidos.
4. Stock y cuenta corriente.
5. Pagos.
