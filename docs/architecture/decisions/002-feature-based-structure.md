# ADR 002 — Estructura orientada a funcionalidades

- **Estado:** Aceptado
- **Fecha:** 2026-07-24
- **Decisores:** Equipo Distrisoft

## Contexto

Un frontend de distribuidora crecerá en dominios (catálogo, pedidos, pagos, etc.). Una estructura solo por tipo técnico (`components/`, `hooks/`, `services/`) escala mal cuando varias personas trabajan en circuitos distintos.

## Decisión

Adoptar una organización híbrida:

- `app/` para shell técnico (router, providers, layouts, config).
- `pages/` para rutas.
- `shared/` para piezas transversales.
- `features/<dominio>/` solo cuando exista una funcionalidad real.

No crear carpetas de feature vacías por adelantado.

`admin` y `commerce` son layouts/áreas de navegación, no features de dominio.

## Alternativas consideradas

| Alternativa                     | Motivo de descarte                            |
| ------------------------------- | --------------------------------------------- |
| Solo carpetas técnicas globales | Dificulta ubicar un circuito completo.        |
| Features vacías desde el día 1  | Abstracción prematura y ruido estructural.    |
| Dos aplicaciones web separadas  | Duplicaría tooling y contratos en esta etapa. |

## Consecuencias

### Positivas

- El código de negocio vivirá cerca de su UI y su acceso a API.
- Se evita sobre-diseñar antes de conocer el dominio en pantalla.
- Las áreas admin/commerce pueden compartir features sin forzar un único layout.

### Negativas / trade-offs

- Al inicio habrá más páginas placeholder que features.
- Habrá que mover código de `pages/` hacia `features/` cuando un circuito deje de ser estructural.
