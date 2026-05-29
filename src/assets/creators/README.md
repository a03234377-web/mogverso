# Fotos de creadores (global)

Imágenes compartidas entre rankings, torneo y noticias. Se importan en código para que Next.js las optimice (WebP, tamaños responsivos).

```ts
import { creatorImage } from "@/assets/creators";

const photo = creatorImage("kappah.webp");
```

## Comprobar

```bash
npm run check:images
```

## Descargar desde el sitio original

```bash
npm run download:images -- --base-url https://tu-dominio.com
```

Los archivos se guardan aquí (`src/assets/creators/`). Respeta mayúsculas (`SergiCabrer.webp`).

Tras añadir un `.webp` nuevo, regístralo en `index.ts` con un `import` estático.
