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

4. Para votos y heal server-side, añade `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON de la cuenta de servicio, una línea). Opcional en local: sin ella las rutas `/api/vote/*` y `/api/heal/*` responden 503.

5. Añade imágenes en `public/img/` (ver lista en `public/legacy/app-runtime.js`, objeto `FOTOS`).

6. Arranca el servidor:

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

## Reglas de Firebase (solo consola — no en el repo)

Publica reglas restrictivas en Firebase Console → Realtime Database → **Reglas**. **No** versiones el JSON en GitHub (repo público).

Checklist operativo (doc privado o consola):

| Ruta                                               | Lectura                        | Escritura cliente                                    |
| :------------------------------------------------- | :----------------------------- | :--------------------------------------------------- |
| `rankvote/current`, `rankvoteHistory`              | Pública                        | **Denegada** (heal/votos vía API + Admin SDK)        |
| `rankOverrides`, `rankMovements*`                  | Pública                        | **Denegada**                                         |
| `rankvoteVotes/*`, `entryVotes/*`, `torneoVotes/*` | Denegada o solo lectura propia | **Denegada** (API server-side)                       |
| `entryVote/current`                                | Pública                        | **Denegada**                                         |
| `torneo/state`                                     | Pública                        | **Denegada**                                         |
| `announcements`                                    | Pública                        | **Denegada**                                         |
| `aura/scores`                                      | Pública                        | **Denegada** (escritura solo Admin; lectura en vivo) |

Tras desplegar la capa `/api/*`, bloquea **toda** escritura desde el cliente SDK; solo Admin SDK escribe.

Rutas que usa el código: `src/lib/firebase/client.ts` (lectura), `src/lib/firebase/server-*.ts` (escritura).

## Seguridad operativa

- Rota `ADMIN_SECRET` y `RECAPTCHA_SECRET_KEY` periódicamente.
- Restringe la API key de Firebase por dominio en Google Cloud Console.
- `useSecurityGuard` es anti-copia UX, no un control de seguridad.

## reCAPTCHA en local

En `pnpm run dev` **no hace falta** configurar reCAPTCHA: ni `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` ni `RECAPTCHA_SECRET_KEY`. Los votos (aura, rankvote, etc.) funcionan sin captcha aunque copies otras variables de producción.

En **Vercel/producción** sí debes tener las dos claves del mismo sitio reCAPTCHA v3 y el dominio desplegado autorizado en [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).

## Depuración

- Si el loader de Firebase no desaparece, revisa `.env.local` y la consola del navegador.
- Si los votos fallan con 503, falta `FIREBASE_SERVICE_ACCOUNT_JSON`.
- **Aura (`/aura`)**: el cupo semanal y la papeleta se leen con `GET /api/aura/quota` (Admin SDK); las puntuaciones del mes con `GET /api/aura/scores`. Sin la cuenta de servicio en el servidor, votos y cupo no persisten. Tras votar, en Firebase Console revisa `auraDeviceWeek/dev_<deviceId>_<weekId>` y `aura/scores`.
- **Reiniciar votos de aura** (dev/staging, requiere `ADMIN_SECRET` + `FIREBASE_SERVICE_ACCOUNT_JSON`):

  ```bash
  curl -X POST http://localhost:3000/api/admin/aura/reset \
    -H "Authorization: Bearer TU_ADMIN_SECRET" \
    -H "Content-Type: application/json" \
    -d '{}'
  ```

  Borra papeletas semanales (`auraDeviceWeek`, `auraIpWeek`) y puntuaciones (`aura/scores`). Tras el reset, recarga `/aura` para que el cupo se vuelva a leer desde la API.

- Si faltan fotos, las rutas en `/img/` devolverán 404; la UI muestra emojis de respaldo.
- Si reCAPTCHA falla **solo en producción**, revisa dominio en Google, par site key + secret y variables en Vercel.

## Torneo (miércoles 22:30 → sábado, 24 h por fase)

- **Calendario:** octavos (top 16 del ranking, 1v2, 3v4…) → cuartos → semis → final. Votación simultánea en todos los duelos de la fase activa (1 voto por combate).
- **Producción:** `heal` al visitar `/torneo` y al votar; opcional cron `GET /api/cron/torneo-advance` en Vercel Pro.

## Editar estilos

- Estilos de la app: `src/app/looksmax.css` (extraídos del diseño original).
- Utilidades Tailwind: `src/app/globals.css` (`@import "tailwindcss"`).
