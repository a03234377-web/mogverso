"use client";

import { SectionTitle } from "@/features/shared/components/ui/SectionTitle";
import { MatchCard } from "./MatchCard";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { formatDuration } from "@/features/shared/lib/utils";
import type { TorneoMatch, TorneoState } from "@/features/shared/lib/types";
import type { PHASES } from "@/features/torneo/data/torneo-players";

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
  const breakRemaining = useCountdown(
    state?.phase === phases.BREAK_FINAL ? state.phaseEnd : null,
  );

  if (!state) return null;

  let matches: Record<string, TorneoMatch> | undefined;
  let ids: string[] = [];
  let round = "";
  let title = "";
  let show = false;

  if (state.phase === phases.CUARTOS_VOTING && state.cuartosMatches) {
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
  } else if (state.phase === phases.BREAK_FINAL && state.semisMatches) {
    matches = state.semisMatches;
    ids = ["semi_0", "semi_1"];
    round = "semis";
    title = `Resultados Semifinales — Final en ${formatDuration(breakRemaining.remainingMs)}`;
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
            <MatchCard
              key={id}
              match={m}
              idx={idx}
              round={round}
              state={state}
              myVote={getLocalVote(id)}
              onVote={(name) => onVote(id, name)}
            />
          );
        })}
      </div>
    </div>
  );
}
