import type { Metadata } from "next";
import type { Ranker } from "@/features/rankings/data/rankers";
import { LOOKSMAX_PATHS, profilePath } from "@/features/app/routes";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const rankingsMetadata: Metadata = buildPageMetadata({
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

export const rankvoteMetadata: Metadata = buildPageMetadata({
  title: "Votar ranking",
  description:
    "Vota en el duelo de ranking looksmaxer. Tu voto decide quién sube o baja en la comunidad.",
  path: LOOKSMAX_PATHS.rankvote,
});

export const torneoMetadata: Metadata = buildPageMetadata({
  title: "Torneo en vivo",
  description:
    "Torneo looksmaxer en directo. Vota los partidos y sigue las fases del bracket.",
  path: LOOKSMAX_PATHS.torneo,
});

export const noticiasMetadata: Metadata = buildPageMetadata({
  title: "Noticias",
  description:
    "Últimas noticias y novedades del mundo looksmaxer español: rankings, ascensos y comunidad.",
  path: LOOKSMAX_PATHS.noticias,
});

export const consejoMetadata: Metadata = buildPageMetadata({
  title: "Consejos looksmax",
  description:
    "Guías y consejos diarios de looksmaxing: estilo, salud, percepción y mentalidad.",
  path: LOOKSMAX_PATHS.consejo,
});

export const homeRedirectMetadata: Metadata = buildPageMetadata({
  title: "Ranking Oficial",
  description:
    "Ranking oficial de looksmaxing en España. Votaciones en tiempo real, torneo y comunidad.",
  path: "/rankings",
});

export function buildProfileMetadata(ranker: Ranker, index: number): Metadata {
  const rank = index + 1;
  return buildPageMetadata({
    title: `${ranker.name} — Puesto #${rank}`,
    description: `${ranker.title} · ${ranker.sub}. Score ${ranker.score}. ${ranker.bio.slice(0, 140)}…`,
    path: profilePath(index),
    keywords: [ranker.name, "looksmax españa", "ranking looksmax", ranker.title],
  });
}

export const profileNotFoundMetadata: Metadata = buildPageMetadata({
  title: "Perfil no encontrado",
  description: "Este perfil no existe en el ranking de LooksMax España.",
  path: "/rankings",
  noIndex: true,
});
