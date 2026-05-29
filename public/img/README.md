# Fotos de creadores

Coloca aquí las imágenes referenciadas por la app. Los nombres deben coincidir **exactamente** (Linux distingue mayúsculas: `SergiCabrer.jpeg`).

## Comprobar

```bash
npm run check:images
```

## Descargar desde el sitio original

El HTML legacy (`public/legacy-body.html` en git) usa rutas **relativas** (`/img/kappah.png`), no URLs de internet en el código. Para bajarlas desde donde estuvieran publicadas:

```bash
# Sustituye por la URL donde existía la carpeta img/ (Firebase Hosting, Vercel anterior, etc.)
npm run download:images -- --base-url https://tu-dominio.com
```

El script también lee `DOWNLOAD_IMAGES_BASE_URL` o `NEXT_PUBLIC_SITE_URL` de `.env.local`, y prueba `https://<PROJECT_ID>.web.app` si tienes Firebase configurado.

Opciones útiles:

- `--html ruta/a/index.html` — extrae además `src` de un HTML antiguo tuyo
- `--dry-run` — lista URLs sin descargar
- `npm run download:images -- --help`

Origen habitual: copia desde la carpeta `img/` de la web estática original de LooksMax España.
