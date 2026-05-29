# Auditoría global de problemas (`/problems-search`)

## Cuándo ejecutar

- El usuario invoca **`/problems-search`** o pide auditoría global del repositorio.
- Objetivo: **inventariar y priorizar**; no corregir salvo petición posterior.

## Objetivo

Recorrer **mogverso** de lo global a lo local: build Next.js, Firebase, migración looksmax, calidad de código. Informe en español, prioridades P0→P3.

## Comprobaciones automáticas

Cuando sea posible:

- `npm run lint`
- `npm run build`
- Opcional: revisar tipos con `npx tsc --noEmit`

## Factores y prioridades

| Nivel | Criterio |
| :--- | :--- |
| **P0** | Build roto, secretos en git, Firebase mal configurado en prod, rutas críticas inaccesibles |
| **P1** | Hidratación/SSR, listeners Firebase sin cleanup, votación/ranking inconsistente, `'use client'` mal aplicado |
| **P2** | Lint, tipos, CSS duplicado, componentes monolíticos, README desactualizado |
| **P3** | Nitpicks de estilo, optimizaciones prematuras |

### Áreas a revisar

1. **Infra:** `package.json`, `next.config.ts`, `.env*` en git, CI si existe.
2. **App Router:** `src/app/layout.tsx`, rutas, metadata, `'use client'` vs server.
3. **Firebase:** init singleton, reglas, índices, manejo offline/loading (`#fb-loader`).
4. **Migración looksmax:** DOM imperativo restante, `.page.active`, cursor custom, tabs sin rutas.
5. **Estilos:** conflicto `globals.css` vs `looksmax.css`, fuentes (Geist vs Syne/Bebas en looksmax).
6. **Seguridad:** reCAPTCHA, validación server-side de votos, rate limiting en Route Handlers.
7. **DX:** alias `@/*`, ESLint/Prettier, `.cursor/` alineado con el repo.

## Formato del informe

```markdown
## Resumen ejecutivo
…

## P0 — Crítico
- [ ] **Título** — ruta — impacto — fix sugerido

## P1 — Alto
…

## Comprobaciones ejecutadas
- `npm run lint`: …
- `npm run build`: …
```

Máximo ~15–25 ítems con impacto real. Evidencia con rutas y salidas de comandos.

## Resumen para el agente

- Repo **mogverso** (Next.js + Firebase), no Ryunix ni otro monorepo.
- No aplicar fixes masivos sin que el usuario lo pida.
