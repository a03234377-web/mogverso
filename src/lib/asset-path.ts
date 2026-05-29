/**
 * Ruta pública bajo /public. Acepta "img/foo.png" o "/img/foo.png".
 */
export function publicAsset(path: string): string {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}
