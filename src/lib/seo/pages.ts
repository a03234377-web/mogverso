import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";
import { LOOKSMAX_PATHS, profilePath } from "@/features/app/routes";
import { buildPageGenerateMetadata } from "@/lib/seo/metadata";

export const generateRankingsMetadata = buildPageGenerateMetadata({
  title: "Rankings LooksMax",
  description:
    "Ranking oficial de looksmaxing en España. Consulta posiciones, scores y movimientos en tiempo real.",
  path: LOOKSMAX_PATHS.rankings,
  keywords: [
    "looksmax españa",
    "ranking looksmax",
    "looksmaxing ranking",
    "creadores looksmax",
  ],
});

export const generateRankvoteMetadata = buildPageGenerateMetadata({
  title: "Votar ranking",
  description:
    "Vota en el duelo de ranking looksmaxer. Tu voto decide quién sube o baja en la comunidad.",
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
    "Últimas noticias y novedades del mundo looksmaxer español: rankings, ascensos y comunidad.",
  path: LOOKSMAX_PATHS.noticias,
});

export const generateAuraMetadata = buildPageGenerateMetadata({
  title: "Aura LooksMax",
  description:
    "Vota aura del top 70 del ranking oficial: +230 o −100 por voto. 10 votos semanales y reinicio mensual de puntuaciones.",
  path: LOOKSMAX_PATHS.aura,
  keywords: ["aura looksmax", "votación aura", "ranking looksmax españa"],
});

export const generateHomeRedirectMetadata = buildPageGenerateMetadata({
  title: "Ranking Oficial",
  description:
    "Ranking oficial de looksmaxing en España. Votaciones en tiempo real, torneo y comunidad.",
  path: "/rankings",
});

export const generateProfileNotFoundMetadata = buildPageGenerateMetadata({
  title: "Perfil no encontrado",
  description: "Este perfil no existe en el ranking de LooksMax España.",
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
