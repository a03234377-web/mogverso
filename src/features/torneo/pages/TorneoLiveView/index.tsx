"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { IconLabel } from "@/components/icons";
import { ActivePage } from "@/components/ui/ActivePage";
import { HeroSection } from "@/components/ui/HeroSection";
import { PAGE_SCROLL_REVEAL } from "@/lib/scroll-reveal";
import { TorneoPhaseCard } from "./TorneoPhaseCard";
import { TorneoMatchesSection } from "./TorneoMatchesSection";
import { TorneoBracket } from "./TorneoBracket";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  TORNEO_HERO_EYEBROW,
  TORNEO_HERO_SUBTITLE,
  TORNEO_HERO_TITLE,
} from "@/features/torneo/components/torneo-hero-content";
import { TorneoEditionCalendar } from "@/features/torneo/components/TorneoEditionCalendar";
import { useTorneo } from "@/features/torneo/hooks/useTorneo";
import { getUpcomingTorneoStartMs } from "@/lib/torneo-schedule";

export function TorneoLiveView() {
  const { state, loading, voting, voteError, vote, getLocalVote } = useTorneo(true);
  const [, setTick] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <ActivePage id="page-torneo" active>
      <ScrollReveal className="w-full" {...PAGE_SCROLL_REVEAL}>
        <HeroSection
          variant="torneo"
          eyebrow={TORNEO_HERO_EYEBROW}
          title={TORNEO_HERO_TITLE}
          subtitle={TORNEO_HERO_SUBTITLE}
        />
      </ScrollReveal>

      <TorneoPhaseCard state={state} loading={loading} onRestart={refresh} />

      <div className="mx-auto mb-6 flex justify-center px-5 max-md:px-3">
        <TorneoEditionCalendar
          editionStartMs={state?.editionStartMs ?? getUpcomingTorneoStartMs(now)}
          now={now}
        />
      </div>

      {voteError ? (
        <p
          className="mx-auto mb-4 max-w-[860px] px-5 text-center text-sm font-semibold text-lm-red2 max-md:px-3"
          role="alert"
        >
          {voteError}
        </p>
      ) : null}
      {voting ? (
        <p className="mx-auto mb-4 max-w-[860px] px-5 text-center text-sm text-lm-text2 max-md:px-3">
          Registrando voto…
        </p>
      ) : null}

      <TorneoMatchesSection
        state={state}
        getLocalVote={getLocalVote}
        votingDisabled={voting}
        onVote={async (matchId, name) => {
          const result = await vote(matchId, name);
          if (result.ok) refresh();
        }}
      />

      <div className="mx-auto mb-8 max-w-[860px] px-5 pb-8 max-md:px-3 max-md:pb-4">
        <SectionTitle center className="mb-4">
          <IconLabel icon="bar-chart-3" iconSize={20}>
            Cuadro del Torneo
          </IconLabel>
        </SectionTitle>
        <TorneoBracket state={state} getLocalVote={getLocalVote} />
      </div>
    </ActivePage>
  );
}
