"use client";

import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PHASES } from "@/features/torneo/data/torneo-players";
import { useTorneoBracketPreview } from "@/features/torneo/hooks/useTorneoBracketPreview";
import { getTorneoMatchesView } from "@/features/torneo/lib/torneo-matches-view";
import type { TorneoState } from "@/types/looksmax";
import { MatchCard } from "./MatchCard";

export function TorneoMatchesSection({
  state,
  getLocalVote,
  onVote,
  votingDisabled,
}: {
  state: TorneoState | null;
  getLocalVote: (matchId: string) => string | null;
  onVote: (matchId: string, name: string) => Promise<void>;
  votingDisabled?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  const needsPreview = state?.phase === PHASES.WAITING_OCTAVOS && !state.matches?.oct_0;
  const previewMatches = useTorneoBracketPreview(needsPreview);
  const view = getTorneoMatchesView(state, previewMatches, now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!view) return null;

  return (
    <div
      className="mx-auto mb-8 block max-w-[860px] px-5 max-md:px-3"
      id="torneoMatchesSection"
    >
      <SectionTitle center className="mb-4" id="torneoMatchesTitle">
        {view.title}
      </SectionTitle>
      {view.pendingStart ? (
        <p className="mb-4 text-center text-sm font-semibold text-lm-orange">
          Abriendo votación en octavos… Los botones se activan en unos segundos.
        </p>
      ) : null}
      <div className="flex flex-col gap-3" id="torneoMatchesGrid">
        {view.ids.map((id, idx) => {
          const m = view.matches[id];
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
                round={view.round}
                state={state!}
                myVote={getLocalVote(id)}
                canVote={view.canVote && !votingDisabled}
                previewLive={view.pendingStart}
                onVote={(name) => onVote(id, name)}
              />
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
