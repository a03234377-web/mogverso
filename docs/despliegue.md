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
```

Opcionales: `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.

## Dominio personalizado

En Vercel → **Settings → Domains**, añade tu dominio y actualiza `NEXT_PUBLIC_SITE_URL`.

## Build

El comando por defecto es `npm run build`. La configuración en `vercel.json` solo documenta el framework; Vercel no requiere archivo extra para Next.js.

## Notas

- No subas `.env.local` al repositorio.
- Las reglas de Firebase deben permitir lectura/escritura según tu modelo de votación (considera validación en servidor para producción seria).
