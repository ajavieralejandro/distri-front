# ADR 008 — Hash routing para GitHub Pages

## Estado

Aceptado

## Contexto

La demo web se publica en GitHub Pages bajo `/distri-front/`. Pages no ofrece rewrites de SPA; una recarga en `/admin/dashboard` fallaría con 404.

## Decisión

1. `vite build --mode pages` usa `base: '/distri-front/'`.
2. `.env.pages` define `VITE_ROUTER_MODE=hash`.
3. `AppRouterProvider` elige `HashRouter` o `BrowserRouter` desde `resolveRouterMode` (centralizado).
4. MSW se inicia con `serviceWorker.url` basado en `import.meta.env.BASE_URL`.

## Consecuencias

- URLs públicas: `…/distri-front/#/ruta`.
- Recargas y deep links funcionan sin servidor de rewrites.
- Tests siguen usando `MemoryRouter`; se añaden pruebas específicas de hash.
- El modo API local puede seguir con `BrowserRouter` y `base: '/'`.
