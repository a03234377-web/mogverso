import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";
import { LOOKSMAX_PATHS, profilePath } from "@/features/app/routes";
import { buildPageGenerateMetadata } from "@/lib/seo/metadata";

export const generateRankingsMetadata = buildPageGenerateMetadata({
  title: "Rankings Aura",
  description:
    "Ranking oficial de creadores en España. Consulta posiciones, aura y movimientos en tiempo real.",
  path: LOOKSMAX_PATHS.rankings,
  keywords: ["aura españa", "ranking aura", "votación aura", "creadores españa"],
});

export const generateRankvoteMetadata = buildPageGenerateMetadata({
  title: "Votar ranking",
  description:
    "Vota en el duelo de ranking. Tu voto decide quién sube o baja en la comunidad.",
  path: LOOKSMAX_PATHS.rankvote,
});

export const generateTorneoMetadata = buildPageGenerateMetadata({
  title: "Torneo en vivo",
  description:
    "Torneo looksmaxer en directo. Vota los partidos y sigue las fases del bracket.",
  path: LOOKSMAX_PATHS.torneo,
});

export const generateNoticiasMetadata = buildPageGenerateMetadata({
  title: "Noticias",
  description:
    "Últimas noticias y novedades de la comunidad: rankings, aura, ascensos y torneo.",
  path: LOOKSMAX_PATHS.noticias,
});

export const generateAuraMetadata = buildPageGenerateMetadata({
  title: "Votación Aura",
  description:
    "Vota aura del top 70 del ranking oficial: +230 o −100 por voto. 10 votos semanales y reinicio mensual de puntuaciones.",
  path: LOOKSMAX_PATHS.aura,
  keywords: ["aura españa", "votación aura", "ranking aura"],
});

export const generateHomeRedirectMetadata = buildPageGenerateMetadata({
  title: "Aura y Rankings",
  description:
    "Votación de aura y ranking de creadores en España. Votaciones en tiempo real y comunidad.",
  path: "/rankings",
});

export const generateProfileNotFoundMetadata = buildPageGenerateMetadata({
  title: "Perfil no encontrado",
  description: "Este perfil no existe en el ranking de Aura España.",
  path: "/rankings",
  noIndex: true,
});

export function buildProfileGenerateMetadata(ranker: Ranker, rank?: number) {
  const position = rank ?? RANKERS.findIndex((r) => r.name === ranker.name) + 1;
  return buildPageGenerateMetadata({
    title: `${ranker.name} — Puesto #${position}`,
    description: `${ranker.title} · ${ranker.sub}. Score ${ranker.score}. ${ranker.bio.slice(0, 140)}…`,
    path: profilePath(ranker.name),
    keywords: [ranker.name, "looksmax españa", "ranking looksmax", ranker.title],
  });
}
