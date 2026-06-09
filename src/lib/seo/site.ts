/** URL pública del sitio (Vercel / dominio propio). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://mogverso.vercel.app";
}

export const SITE_NAME = "Aura España";
export const SITE_TAGLINE = "Votación de aura y ranking de creadores en España";

export const DEFAULT_DESCRIPTION =
  "Vota aura del top del ranking, sigue ascensos en tiempo real y la comunidad de creadores en España.";
