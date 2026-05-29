/**
 * Ruta pública bajo /public o URL absoluta.
 * Acepta "img/foo.webp", "/img/foo.webp", o "https://…".
 * Opcional: NEXT_PUBLIC_CREATOR_IMAGES_BASE (sin barra final) para CDN u otro origen.
 */
export function publicAsset(path: string): string {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = process.env.NEXT_PUBLIC_CREATOR_IMAGES_BASE?.replace(/\/$/, "");
  return base ? `${base}${normalized}` : normalized;
}
