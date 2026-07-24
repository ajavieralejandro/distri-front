# ADR 001 — React, TypeScript y Vite

- **Estado:** Aceptado
- **Fecha:** 2026-07-24
- **Decisores:** Equipo Distrisoft

## Contexto

Necesitamos un frontend web para Distrisoft con dos áreas (`admin` y `commerce`), tipado fuerte, buen DX local y capacidad de crecer por features sin acoplarse a un framework full-stack.

## Decisión

Utilizar:

- **React** para la UI.
- **TypeScript** en modo estricto.
- **Vite** como toolchain de desarrollo y build.

No utilizar Next.js en esta etapa.

## Alternativas consideradas

| Alternativa   | Motivo de descarte (etapa actual)                                                                |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Next.js       | Aporta SSR/RSC que todavía no necesitamos; suma complejidad de despliegue y de auth por cookies. |
| CRA           | Proyecto en modo mantenimiento; Vite es el estándar actual para SPA.                             |
| Vue / Angular | Válidos, pero el stack decidido del equipo es React.                                             |

## Consecuencias

### Positivas

- Arranque rápido y build predecible.
- Ecosistema maduro (Router, Query, Hook Form, Testing Library).
- Alineado con una SPA que consume una API NestJS existente.

### Negativas / trade-offs

- No hay SSR/SEO de primera parte (aceptable para un panel operativo autenticado).
- La autenticación por cookies requerirá CORS/`credentials` bien configurados en API y web.
