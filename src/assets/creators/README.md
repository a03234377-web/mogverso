# Fotos de creadores (global)

Imágenes compartidas entre rankings, torneo y noticias. Se importan en código para que Next.js las optimice (WebP, tamaños responsivos).

## Convención de nombre

Cada archivo debe coincidir con el **nombre del ranker** en minúsculas; los espacios van como `-`:

| Ranker       | Archivo             |
| ------------ | ------------------- |
| Kappah       | `kappah.webp`       |
| Lucas G      | `lucas-g.webp`      |
| Nil Ojeda    | `nil-ojeda.webp`    |
| Arnau Mestre | `arnau-mestre.webp` |

Usa `rankerPhotoFile(name)` de `@/assets/creators` para obtener el nombre de archivo. En runtime, `getRankerPhoto(name)` en `avatars.ts` resuelve la foto automáticamente.

## Añadir una foto nueva

1. Guarda el `.webp` en esta carpeta con el nombre correcto.
2. Regenera `index.ts` (imports estáticos) o añade manualmente el `import` y la entrada en `CREATOR_IMAGE_FILES` / `CREATOR_IMAGES`.

Excepción: `kappahsub.webp` es un asset auxiliar de noticias, no sigue el nombre de un ranker.
