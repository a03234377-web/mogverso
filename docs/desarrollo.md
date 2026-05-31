# Guía de desarrollo

## Requisitos

- Node.js 22+ (requerido por pnpm 11)
- pnpm 11+ (Corepack: `corepack enable`)
- Proyecto Firebase con **Realtime Database** habilitada

## Configuración local

1. Clona el repositorio e instala dependencias:

   ```bash
   pnpm install
   ```

2. Crea `.env.local` desde la plantilla:

   ```bash
   cp .env.example .env.local
   ```

3. En la [consola de Firebase](https://console.firebase.google.com/), copia la configuración web del proyecto a las variables `NEXT_PUBLIC_FIREBASE_*`.

4. Añade imágenes en `public/img/` (ver lista en `public/legacy/app-runtime.js`, objeto `FOTOS`).

5. Arranca el servidor:

   ```bash
   pnpm run dev
   ```

## Calidad de código

```bash
# ESLint
pnpm run lint

# Prettier
pnpm run format:check
pnpm run format

# Markdown (README y docs/)
pnpm run mdlint
```

## Reglas de Firebase

Copia el JSON de [`docs/firebase-rules.json`](firebase-rules.json) en Firebase Console → Realtime Database → **Reglas** → Publicar.

La app necesita escritura en:

| Ruta                                                                     | Uso                                           |
| :----------------------------------------------------------------------- | :-------------------------------------------- |
| `rankvote/current`                                                       | Crear ronda cada 3 h, `resolved`, `resolving` |
| `rankvote/current/votes/*`                                               | Incrementar votos (validado)                  |
| `rankOverrides`, `rankMovements`, `rankMovementsUp`, `rankMovementsDown` | Ranking y pilas de movimientos                |
| `rankvoteHistory/*`                                                      | Historial (solo creación, `!data.exists()`)   |
| `rankvoteVotes/*`, `entryVotes/*`, `torneoVotes/*`                       | Anti-fraude por dispositivo/IP                |
| `entryVote/current`                                                      | Votación de entrada                           |
| `torneo/state`                                                           | Fases del torneo y votos de partidos          |

Solo desarrollo local abierto: [`firebase-rules-dev.example.json`](firebase-rules-dev.example.json).

## Depuración

- Si el loader de Firebase no desaparece, revisa `.env.local` y la consola del navegador.
- Si faltan fotos, las rutas en `/img/` devolverán 404; la UI muestra emojis de respaldo.
- El marcado legacy está en `public/legacy-body.html`; la lógica en `public/legacy/app-runtime.js`.

## Editar estilos

- Estilos de la app: `src/app/looksmax.css` (extraídos del diseño original).
- Utilidades Tailwind: `src/app/globals.css` (`@import "tailwindcss"`).
