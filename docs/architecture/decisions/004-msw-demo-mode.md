# ADR 004 — MSW para modo demostración

- **Estado:** Aceptado
- **Fecha:** 2026-07-24
- **Decisores:** Equipo Distrisoft

## Contexto

Necesitamos una demo presentable de `/admin` y `/commerce` antes de que Distisoft API implemente autenticación y dominio comercial.

## Decisión

Usar **Mock Service Worker (MSW)** cuando `VITE_DATA_SOURCE=mock`, interceptando `fetch` con handlers provisionales. La UI consume siempre `features/*/api` → `httpClient`, sin importar fixtures desde páginas.

Zustand se usa solo para el **carrito** (estado local compartido + persistencia demo), no para cachear respuestas de servidor.

## Alternativas

| Alternativa                    | Motivo de descarte                                        |
| ------------------------------ | --------------------------------------------------------- |
| Fixtures importadas en páginas | Rompe la arquitectura API-first y dificulta el reemplazo. |
| JSON Server aparte             | Más infra local; MSW vive junto al frontend.              |
| Fallback api→mock              | Enmascara fallos reales; prohibido.                       |

## Consecuencias

- Demo usable sin backend comercial.
- Riesgo de confundir mock con contrato real → mitigado con docs PROVISIONAL y banner.
- MSW no arranca en producción (`shouldStartMockWorker`).
