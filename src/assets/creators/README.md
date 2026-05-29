# Fotos de creadores (global)

Imágenes compartidas entre rankings, torneo y noticias. Se importan en código para que Next.js las optimice (WebP, tamaños responsivos).

```ts
import { creatorImage } from "@/assets/creators";

const photo = creatorImage("kappah.webp");
```

Coloca los `.webp` en esta carpeta. Respeta mayúsculas (`SergiCabrer.webp`).

Tras añadir un archivo nuevo, regístralo en `index.ts` con un `import` estático y entrégalo en `CREATOR_IMAGES`.
