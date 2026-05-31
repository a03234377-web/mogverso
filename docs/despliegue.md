# Despliegue en Vercel

## Pasos

1. Sube el código a GitHub, GitLab o Bitbucket.
2. En [Vercel](https://vercel.com), **Add New Project** e importa el repositorio.
3. Framework preset: **Next.js** (detectado automáticamente).
4. En **Environment Variables**, añade todas las variables de `.env.example` con valores de producción.
5. Despliega.

## Variables recomendadas en producción

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app

# Server-only (Vercel — sin NEXT_PUBLIC_)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
RECAPTCHA_SECRET_KEY=...
ADMIN_SECRET=...
CRON_SECRET=...
```

Opcionales: `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Vercel Cron

`vercel.json` define tres tareas:

| Ruta                         | Frecuencia  |
| :--------------------------- | :---------- |
| `/api/cron/rankvote-resolve` | Cada 5 min  |
| `/api/cron/entry-vote`       | Cada 10 min |
| `/api/cron/torneo-advance`   | Cada 5 min  |

Define **`CRON_SECRET`** en Vercel. El scheduler envía `Authorization: Bearer <CRON_SECRET>`; el middleware rechaza peticiones sin ese valor. Los crons resuelven rondas aunque no haya visitantes.

## Dominio personalizado

En Vercel → **Settings → Domains**, añade tu dominio y actualiza `NEXT_PUBLIC_SITE_URL`.

## Build

El comando por defecto es `pnpm run build`. Vercel detecta `pnpm-lock.yaml` automáticamente.

## Vercel Analytics y Speed Insights

La app incluye `@vercel/analytics` y `@vercel/speed-insights` en el layout raíz. Tras el deploy, activa ambos en el dashboard de Vercel.

## Seguridad en producción

Checklist operativo con prioridades y ventajas de cada paso: **`docs/pasos-pendientes.md`**.

- **No** subas `.env.local` al repositorio.
- Configura **reglas RTDB** en Firebase Console (lectura pública en datos de juego; **escritura cliente denegada**). Votos, heal y admin usan Route Handlers + Firebase Admin SDK.
- Restringe la API key de Firebase por HTTP referrer (dominio producción + localhost dev).
- Define `ADMIN_SECRET` fuerte; init/reset torneo solo vía `POST /api/admin/torneo/*` con ese header.
- Define `CRON_SECRET` para `/api/cron/*`; sin él los crons responden 401.
- Los hooks usan **Server Actions**; las rutas `/api/vote/*` y `/api/heal/*` siguen disponibles como alternativa HTTP.
- Opcional: Upstash Redis para rate limiting distribuido en votos y heal on-demand.

## Firebase rules

1. Publica reglas restrictivas en la consola (no en el repo).
2. Verifica que coincidan con las rutas en `src/lib/firebase/server-*.ts`.
3. El cliente solo lee RTDB; toda escritura pasa por `/api/vote/*`, `/api/heal/*` o `/api/admin/*`.
