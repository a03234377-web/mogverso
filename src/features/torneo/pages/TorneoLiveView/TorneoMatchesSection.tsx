"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { OCTAVOS_IDS } from "@/lib/torneo-bracket";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";
import type { PHASES } from "@/features/torneo/data/torneo-players";
import { MatchCard } from "./MatchCard";

export function TorneoMatchesSection({
  state,
  getLocalVote,
  onVote,
  phases,
}: {
  state: TorneoState | null;
  getLocalVote: (id: string) => string | null;
  onVote: (matchId: string, name: string) => Promise<void>;
  phases: typeof PHASES;
}) {
  if (!state) return null;

  let matches: Record<string, TorneoMatch> | undefined;
  let ids: string[] = [];
  let round = "";
  let title = "";
  let show = false;

  if (state.phase === phases.OCTAVOS_VOTING && state.matches) {
    matches = state.matches;
    ids = [...OCTAVOS_IDS];
    round = "octavos";
    title = "Octavos de Final — ¡Vota en todos los duelos!";
    show = true;
  } else if (state.phase === phases.CUARTOS_VOTING && state.cuartosMatches) {
    matches = state.cuartosMatches;
    ids = ["cua_0", "cua_1", "cua_2", "cua_3"];
    round = "cuartos";
    title = "Cuartos de Final — ¡Vota Ahora!";
    show = true;
  } else if (state.phase === phases.SEMIFINALS_VOTING && state.semisMatches) {
    matches = state.semisMatches;
    ids = ["semi_0", "semi_1"];
    round = "semis";
    title = "Semifinales — ¡Vota Ahora!";
    show = true;
  } else if (state.phase === phases.FINAL_VOTING && state.finalMatch) {
    matches = { final_0: state.finalMatch };
    ids = ["final_0"];
    round = "final";
    title = "Gran Final — ¡Vota al Campeón!";
    show = true;
  } else if (state.phase === phases.TORNEO_ENDED && state.finalMatch) {
    matches = { final_0: state.finalMatch };
    ids = ["final_0"];
    round = "final";
    title = "Gran Final — Resultado Final";
    show = true;
  }

  if (!show || !matches) return null;

  return (
    <div
      className="mx-auto mb-8 block max-w-[860px] px-5 max-md:px-3"
      id="torneoMatchesSection"
    >
      <SectionTitle center className="mb-4" id="torneoMatchesTitle">
        {title}
      </SectionTitle>
      <div className="flex flex-col gap-3" id="torneoMatchesGrid">
        {ids.map((id, idx) => {
          const m = matches![id];
          if (!m) return null;
          return (
            <ScrollReveal
              key={id}
              y={28}
              scrollRange="block"
              start="top bottom+=8%"
              className="w-full"
            >
              <MatchCard
                match={m}
                idx={idx}
                round={round}
                state={state}
                myVote={getLocalVote(id)}
                onVote={(name) => onVote(id, name)}
              />
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
