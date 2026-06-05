"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons";
import {
  PhaseCard,
  PhaseDisplay,
  PhaseLabel,
  PhaseSub,
  PhaseTimer,
  PhaseTitle,
} from "@/features/torneo/components/PhaseCard";
import { TORNEO_VOTING_SUB } from "@/features/torneo/components/torneo-prestart-copy";
import { PHASES } from "@/features/torneo/data/torneo-players";
import { healTorneoApi } from "@/lib/api/vote-client";
import { useCountdown } from "@/hooks/useCountdown";
import {
  getTorneoPhaseCountdownTargetMs,
  getTorneoVotingTargetMs,
  getUpcomingTorneoStartMs,
  isTorneoLegacyBreakReadyToOpen,
  isTorneoPhaseExpired,
  isTorneoVotingPhaseExpired,
} from "@/lib/torneo-schedule";
import type { TorneoState } from "@/types/looksmax";
import { TorneoPhaseEnded, TorneoPhaseWaitingOctavos } from "./TorneoPhaseViews";

export function TorneoPhaseCard({
  state,
  loading,
  onRestart,
}: {
  state: TorneoState | null;
  loading: boolean;
  onRestart: () => void;
}) {
  const cuartosPeriodExpired =
    state?.phase === PHASES.BREAK_CUARTOS &&
    isTorneoVotingPhaseExpired({ ...state, phase: PHASES.CUARTOS_VOTING });
  const cuartosVotingLive =
    state?.phase === PHASES.CUARTOS_VOTING ||
    (state?.phase === PHASES.BREAK_CUARTOS &&
      isTorneoLegacyBreakReadyToOpen(state) &&
      !cuartosPeriodExpired);
  const countdownEnd = state
    ? cuartosPeriodExpired && state.phase === PHASES.BREAK_CUARTOS
      ? getTorneoVotingTargetMs({ ...state, phase: PHASES.SEMIFINALS_VOTING })
      : cuartosVotingLive && state.phase === PHASES.BREAK_CUARTOS
        ? getTorneoVotingTargetMs({ ...state, phase: PHASES.CUARTOS_VOTING })
        : getTorneoPhaseCountdownTargetMs(state)
    : null;
  const cd = useCountdown(countdownEnd);
  const restartEnd =
    state?.phase === PHASES.TORNEO_ENDED ? getUpcomingTorneoStartMs() : null;
  const restartCd = useCountdown(restartEnd);

  useEffect(() => {
    if (state?.phase !== PHASES.WAITING_OCTAVOS || !cd.expired) return;
    void (async () => {
      await healTorneoApi();
      onRestart();
    })();
  }, [state?.phase, cd.expired, onRestart]);

  useEffect(() => {
    const needsHealOnExpire =
      state?.phase === PHASES.OCTAVOS_VOTING ||
      state?.phase === PHASES.CUARTOS_VOTING ||
      state?.phase === PHASES.SEMIFINALS_VOTING ||
      state?.phase === PHASES.FINAL_VOTING ||
      state?.phase === PHASES.BREAK_CUARTOS ||
      state?.phase === PHASES.SEMIFINALS_PROMO ||
      state?.phase === PHASES.BREAK_FINAL;
    const legacyBreakOpen =
      state &&
      (state.phase === PHASES.BREAK_CUARTOS ||
        state.phase === PHASES.SEMIFINALS_PROMO) &&
      (isTorneoLegacyBreakReadyToOpen(state) || cuartosPeriodExpired);
    if (
      !needsHealOnExpire ||
      !state ||
      (!legacyBreakOpen && !cd.expired && !isTorneoPhaseExpired(state))
    ) {
      return;
    }
    void (async () => {
      await healTorneoApi();
      onRestart();
    })();
  }, [state, cd.expired, onRestart]);

  useEffect(() => {
    if (state?.phase !== PHASES.TORNEO_ENDED || !restartCd.expired) return;
    void (async () => {
      await healTorneoApi({ restartIfEnded: true });
      onRestart();
    })();
  }, [state?.phase, restartCd.expired, onRestart]);

  if (loading || !state) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="waiting">
          <PhaseLabel color="orange">CARGANDO TORNEO</PhaseLabel>
          <PhaseTitle color="orange">
            <Icon
              name="hourglass"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            Conectando…
          </PhaseTitle>
          <PhaseSub className="mb-0">Por favor espera</PhaseSub>
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.WAITING_OCTAVOS) {
    return (
      <TorneoPhaseWaitingOctavos
        state={state}
        cd={cd}
        targetMs={countdownEnd ?? state.phaseEnd}
      />
    );
  }

  if (state.phase === PHASES.OCTAVOS_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="green">OCTAVOS EN VIVO · VOTA AHORA</PhaseLabel>
          <PhaseTitle color="green">
            <Icon
              name="gamepad-2"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            OCTAVOS DE FINAL
          </PhaseTitle>
          <PhaseSub>{TORNEO_VOTING_SUB}</PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="green" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.BREAK_CUARTOS && cuartosPeriodExpired) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="gold">
            <span>
              <Icon
                name="zap"
                size={14}
                className="mr-1 inline shrink-0 align-middle"
              />
              SEMIFINALES EN VIVO · VOTA AHORA
            </span>
          </PhaseLabel>
          <PhaseTitle color="gold">
            <Icon
              name="trophy"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            SEMIFINALES
          </PhaseTitle>
          <PhaseSub>{TORNEO_VOTING_SUB}</PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="gold" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.BREAK_CUARTOS && !cuartosVotingLive) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="break">
          <PhaseLabel color="green">PAUSA · CUARTOS PRONTO</PhaseLabel>
          <PhaseTitle color="green">
            <Icon
              name="landmark"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            CUARTOS DE FINAL
          </PhaseTitle>
          <PhaseSub>La votación de cuartos abre en breve</PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="green" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (
    state.phase === PHASES.CUARTOS_VOTING ||
    (state.phase === PHASES.BREAK_CUARTOS && cuartosVotingLive)
  ) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="green">CUARTOS EN VIVO · VOTA AHORA</PhaseLabel>
          <PhaseTitle color="green">
            <Icon
              name="landmark"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            CUARTOS DE FINAL
          </PhaseTitle>
          <PhaseSub>{TORNEO_VOTING_SUB}</PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="green" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.SEMIFINALS_PROMO) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="break">
          <PhaseLabel color="gold">PAUSA · SEMIFINALES PRONTO</PhaseLabel>
          <PhaseTitle color="gold">
            <Icon
              name="trophy"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            SEMIFINALES
          </PhaseTitle>
          <PhaseSub>La votación de semifinales abre en breve</PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="gold" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.SEMIFINALS_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="gold">
            <span>
              <Icon
                name="zap"
                size={14}
                className="mr-1 inline shrink-0 align-middle"
              />
              SEMIFINALES EN VIVO · VOTA AHORA
            </span>
          </PhaseLabel>
          <PhaseTitle color="gold">
            <Icon
              name="trophy"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            SEMIFINALES
          </PhaseTitle>
          <PhaseSub>{TORNEO_VOTING_SUB}</PhaseSub>
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
            <Icon
              name="crown"
              size={18}
              className="mr-1.5 inline shrink-0 align-middle"
            />
            FINAL EN
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
            <span>
              <Icon
                name="crown"
                size={14}
                className="mr-1 inline shrink-0 align-middle"
              />
              GRAN FINAL EN VIVO
            </span>
          </PhaseLabel>
          <PhaseTitle color="gold">GRAN FINAL</PhaseTitle>
          <PhaseSub>{TORNEO_VOTING_SUB}</PhaseSub>
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
