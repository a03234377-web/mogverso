"use client";

import { useEffect } from "react";
import { IconLabel } from "@/components/icons";
import { getInitialTorneoState, PHASES } from "@/features/torneo/data/torneo-players";
import {
  PhaseCard,
  PhaseDisplay,
  PhaseLabel,
  PhaseSub,
  PhaseTimer,
  PhaseTitle,
} from "@/features/torneo/components/PhaseCard";
import { TorneoPhaseEnded, TorneoPhaseWaitingOctavos } from "./TorneoPhaseViews";
import { getNext23Ms } from "./getNext23Ms";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import type { TorneoState } from "@/features/shared/lib/types";
import { useFirebase } from "@/features/app/context/FirebaseProvider";

export function TorneoPhaseCard({
  state,
  loading,
  onRestart,
}: {
  state: TorneoState | null;
  loading: boolean;
  onRestart: () => void;
}) {
  const { fb } = useFirebase();
  const cd = useCountdown(state?.phaseEnd);
  const restartEnd = state?.phase === PHASES.TORNEO_ENDED ? getNext23Ms() : null;
  const restartCd = useCountdown(restartEnd);

  useEffect(() => {
    if (state?.phase !== PHASES.TORNEO_ENDED || !restartCd.expired || !fb) return;
    void (async () => {
      const fresh = getInitialTorneoState(Date.now());
      await fb.initTorneoState(fresh as Record<string, unknown>);
      onRestart();
    })();
  }, [state?.phase, restartCd.expired, fb, onRestart]);

  if (loading || !state) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="waiting">
          <PhaseLabel color="orange">CARGANDO TORNEO</PhaseLabel>
          <PhaseTitle color="orange">
            <IconLabel icon="hourglass" iconSize={18}>
              Conectando…
            </IconLabel>
          </PhaseTitle>
          <PhaseSub className="mb-0">Por favor espera</PhaseSub>
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.WAITING_OCTAVOS) {
    return <TorneoPhaseWaitingOctavos state={state} cd={cd} />;
  }

  if (state.phase === PHASES.CUARTOS_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="green">CUARTOS EN VIVO · VOTA AHORA</PhaseLabel>
          <PhaseTitle color="green">
            <IconLabel icon="landmark" iconSize={18}>
              CUARTOS DE FINAL
            </IconLabel>
          </PhaseTitle>
          <PhaseSub>
            30 minutos de votación · El que más votos tenga pasa a Semifinales
          </PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="green" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.SEMIFINALS_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="gold">
            <IconLabel icon="zap" iconSize={12}>
              SEMIFINALES EN VIVO · VOTA AHORA
            </IconLabel>
          </PhaseLabel>
          <PhaseTitle color="gold">
            <IconLabel icon="trophy" iconSize={18}>
              SEMIFINALES
            </IconLabel>
          </PhaseTitle>
          <PhaseSub>
            30 minutos de votación · Los ganadores van a la Gran Final
          </PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="gold" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.BREAK_FINAL) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="break">
          <PhaseLabel color="purple">DESCANSO ANTES DE LA GRAN FINAL</PhaseLabel>
          <PhaseTitle color="purple">
            <IconLabel icon="crown" iconSize={18}>
              FINAL EN
            </IconLabel>
          </PhaseTitle>
          <PhaseSub>
            Las Semifinales han concluido · La Gran Final comienza en breve
          </PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="purple" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.FINAL_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="semifinals">
          <PhaseLabel color="gold" pulse>
            <IconLabel icon="crown" iconSize={12}>
              GRAN FINAL EN VIVO
            </IconLabel>
          </PhaseLabel>
          <PhaseTitle color="gold">GRAN FINAL</PhaseTitle>
          <PhaseSub>El último enfrentamiento · Solo uno puede ser el Campeón</PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="gold" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.TORNEO_ENDED) {
    return <TorneoPhaseEnded state={state} restartCd={restartCd} />;
  }

  return null;
}
