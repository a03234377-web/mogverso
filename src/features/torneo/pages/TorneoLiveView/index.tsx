"use client";

import { useCallback, useState } from "react";
import { IconLabel } from "@/components/icons";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { HeroSection } from "@/features/shared/components/ui/HeroSection";
import { TorneoPhaseCard } from "./TorneoPhaseCard";
import { TorneoMatchesSection } from "./TorneoMatchesSection";
import { TorneoBracket } from "./TorneoBracket";
import { SectionTitle } from "@/features/shared/components/ui/SectionTitle";
import { useTorneo } from "@/features/torneo/hooks/useTorneo";

export function TorneoLiveView() {
  const { state, loading, vote, getLocalVote, phases } = useTorneo(true);
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return (
    <ActivePage id="page-torneo" active>
      <HeroSection
        variant="torneo"
        eyebrow={
          <IconLabel icon="goal" iconSize={14} iconClassName="text-[#ff6b35]">
            Torneo Oficial · 16 Participantes
          </IconLabel>
        }
        title={
          <>
            Torneo
            <br />
            Looksmaxing
          </>
        }
        subtitle="Eliminación directa · El mejor looksmaxer de España"
      />

      <TorneoPhaseCard state={state} loading={loading} onRestart={refresh} />

      <TorneoMatchesSection
        state={state}
        getLocalVote={getLocalVote}
        onVote={async (matchId, name) => {
          await vote(matchId, name);
          refresh();
        }}
        phases={phases}
      />

      <div className="mx-auto mb-8 max-w-[860px] px-5 pb-8 max-md:px-3 max-md:pb-4">
        <SectionTitle center className="mb-4">
          <IconLabel icon="bar-chart-3" iconSize={20}>
            Cuadro del Torneo
          </IconLabel>
        </SectionTitle>
        <TorneoBracket state={state} />
      </div>
    </ActivePage>
  );
}
