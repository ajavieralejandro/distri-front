# Despliegue en GitHub Pages

URL esperada:

```text
https://ajavieralejandro.github.io/distri-front/
```

Con hash routing:

```text
https://ajavieralejandro.github.io/distri-front/#/login
```

## Por qué `base: /distri-front/`

GitHub Pages publica el sitio bajo el nombre del repositorio. Vite necesita `base` para generar assets (`/distri-front/assets/...`) y evitar 404.

En modo local (`vite` / `vite build`) el `base` sigue siendo `/`. Solo `npm run build:pages` aplica `/distri-front/`.

## Por qué hash routing

GitHub Pages no reescribe rutas SPA hacia `index.html`. Recargar `/admin/dashboard` devolvería 404. `HashRouter` mantiene la ruta en el fragmento (`#/admin/dashboard`).

Ver [ADR 008](architecture/decisions/008-github-pages-hash-routing.md).

## Build local Pages

```powershell
npm run build:pages
npm run preview:pages -- --host
```

Inspeccioná `dist/index.html`: los assets deben empezar con `/distri-front/`.

`vite preview` en la raíz no reproduce la subruta completa; verificá las URLs generadas o serví `dist` bajo `/distri-front/`.

## Workflow

`.github/workflows/deploy-pages.yml`:

1. Push a `main` o `workflow_dispatch`
2. `npm ci` + format/lint/typecheck/test
3. `npm run build:pages`
4. Upload `dist` + `deploy-pages`

## Configurar Pages en GitHub

1. Abrí https://github.com/ajavieralejandro/distri-front/settings/pages
2. **Build and deployment → Source: GitHub Actions**
3. Revisá la pestaña **Actions** tras el push

## Diagnóstico

### Assets 404

- Confirmá `base` en el build Pages.
- Hard refresh / vaciar caché.
- Revisá que `dist/index.html` referencie `/distri-front/assets/...`.

### Service worker

- Debe cargarse desde `/distri-front/mockServiceWorker.js`.
- En DevTools → Application → Service Workers, unregister el worker viejo si quedó de `/`.
- MSW solo inicia con `VITE_DATA_SOURCE=mock` y `VITE_DEMO_MODE=true`.

### Desactivar la demo

Publicá con `VITE_DATA_SOURCE=api` y `VITE_DEMO_MODE=false` (no el modo Pages actual).

## Límites

GitHub Pages solo aloja el frontend estático. No ejecuta NestJS ni PostgreSQL.
