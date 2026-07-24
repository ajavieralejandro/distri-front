# ADR 003 — TanStack Query para estado remoto

- **Estado:** Aceptado
- **Fecha:** 2026-07-24
- **Decisores:** Equipo Distrisoft

## Contexto

Distrisoft Web consumirá casi todo su datos de negocio desde `distrisoft-api`: salud del servicio, catálogo, pedidos, saldos, etc. Ese estado es remoto, cacheable y sujeto a invalidación.

## Decisión

Usar **TanStack Query** como capa de estado de servidor.

React manejará estado visual local (menús, modales, pasos de UI).

No introducir Redux por defecto. Zustand solo si aparece estado de cliente verdaderamente global (por ejemplo carrito) que no corresponda a cache de servidor.

## Alternativas consideradas

| Alternativa                        | Motivo de descarte (etapa actual)                     |
| ---------------------------------- | ----------------------------------------------------- |
| Solo `useEffect` + `useState`      | Escala mal con cache, retries y deduplicación.        |
| Redux / Redux Toolkit Query        | Más ceremonial de la necesaria para el tamaño actual. |
| Duplicar respuestas API en Zustand | Genera doble fuente de verdad.                        |

## Consecuencias

### Positivas

- Cache, estados de carga/error y cancelación con `AbortSignal` quedan estandarizados.
- Las pantallas pueden enfocarse en composición, no en orquestar fetch manual.
- Encaja con un modelo API-first.

### Negativas / trade-offs

- El equipo debe aprender queries/mutations e invalidación.
- Hay que disciplinar qué NO va a Query (estado puramente visual).
