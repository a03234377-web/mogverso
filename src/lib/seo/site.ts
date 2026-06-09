/** URL pública del sitio (Vercel / dominio propio). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://mogverso.vercel.app";
}

export const SITE_NAME = "LooksMax España";
export const SITE_TAGLINE = "El ranking oficial de looksmaxing en España";

export const DEFAULT_DESCRIPTION =
  "Ranking oficial de looksmaxing en España. Votaciones en tiempo real, torneo en vivo, noticias y comunidad.";
