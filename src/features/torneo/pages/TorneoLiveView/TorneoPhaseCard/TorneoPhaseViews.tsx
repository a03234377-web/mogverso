"use client";

import { CreatorImage } from "@/components/CreatorImage";
import { SpainTimezoneNote } from "@/components/ui/SpainTimezoneNote";
import { CreatorIcon, Icon, IconLabel } from "@/components/icons";
import { getPlayerByName } from "@/features/torneo/data/torneo-players";
import {
  PhaseCard,
  PhaseDisplay,
  PhaseLabel,
  PhaseSub,
  PhaseTimer,
  PhaseTitle,
} from "@/features/torneo/components/PhaseCard";
import type { CountdownParts } from "@/hooks/useCountdown";
import type { TorneoState } from "@/types/looksmax";
import { cn } from "@/lib/cn";
import { formatSpainTime, formatSpainWeekdayDate } from "@/lib/spain-time";

export function TorneoPhaseWaitingOctavos({
  state,
  cd,
}: {
  state: TorneoState;
  cd: CountdownParts;
}) {
  const horaStr = formatSpainTime(state.phaseEnd);
  const { weekday: diaStr, dateLabel } = formatSpainWeekdayDate(state.phaseEnd);
  const diaCompleto = `${diaStr} ${dateLabel}`;
  const nextLabel = state.nextPhaseLabel ?? "Cuartos de Final";

  return (
    <PhaseDisplay>
      <PhaseCard variant="waiting">
        <PhaseLabel color="orange">PRÓXIMAMENTE</PhaseLabel>
        <div className="my-1 font-display text-[clamp(0.9rem,2.5vw,1.3rem)] tracking-[3px] text-lm-text2">
          Torneo de LooksMaxing
        </div>
        <PhaseTitle color="orange" className="text-[clamp(2rem,6vw,4.5rem)]">
          {nextLabel}
        </PhaseTitle>
        <div
          className={cn(
            "mx-auto my-1 mb-2.5 w-fit max-w-full font-display text-transparent",
            "bg-[linear-gradient(135deg,var(--color-lm-orange),var(--color-lm-gold2))] bg-clip-text",
            "text-[clamp(1.4rem,6vw,6rem)] tracking-[6px]",
            "max-[360px]:tracking-[1px] max-md:tracking-[2px]",
          )}
        >
          EMPIEZA A LAS {horaStr}
        </div>
        <div className="mb-3.5 flex items-center justify-center gap-1.5 text-sm font-bold text-lm-text2">
          <Icon name="calendar" size={14} />
          {diaCompleto}
        </div>
        <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="orange" />
        <div className="mt-3 text-base font-semibold text-lm-text2">
          <IconLabel icon="zap" iconSize={14} className="justify-center">
            El torneo arrancará automáticamente a las {horaStr}
          </IconLabel>
        </div>
        <SpainTimezoneNote className="mt-3 text-center" />
      </PhaseCard>
    </PhaseDisplay>
  );
}

export function TorneoPhaseEnded({
  state,
  restartCd,
}: {
  state: TorneoState;
  restartCd: CountdownParts;
}) {
  const champ = state.champion ?? "?";
  const champInfo = getPlayerByName(champ);

  return (
    <PhaseDisplay>
      <PhaseCard variant="semifinals">
        <div className="mb-2.5 flex items-center justify-center gap-2 lm-type-label text-lm-gold">
          <Icon name="trophy" size={14} />
          TORNEO FINALIZADO
          <Icon name="trophy" size={14} />
        </div>
        <PhaseTitle color="gold">
          <IconLabel icon="crown" iconSize={18}>
            CAMPEÓN
          </IconLabel>
        </PhaseTitle>
        <PhaseSub>El mejor looksmaxer de España ha sido coronado</PhaseSub>
        <div className="my-4 flex flex-col items-center gap-3">
          <div className="relative size-[90px] overflow-hidden rounded-full border-[3px] border-lm-gold">
            <CreatorImage
              src={champInfo.photo}
              alt={champ}
              className="object-cover"
              sizes="90px"
              fallback={<CreatorIcon name={champ} icon={champInfo.icon} size={36} />}
            />
          </div>
          <div
            className={cn(
              "mx-auto w-fit max-w-full font-display text-transparent",
              "bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text",
              "text-[clamp(2rem,7vw,4rem)] tracking-[4px]",
            )}
          >
            {champ}
          </div>
        </div>
        <div className="mt-7 w-full border-t border-[rgba(232,184,75,0.2)] pt-5 text-center">
          <div
            className={cn(
              "flex items-center justify-center gap-2 font-display text-lm-orange",
              "text-[clamp(1rem,3vw,1.6rem)]",
            )}
          >
            <Icon name="refresh-cw" size={18} />
            NUEVO TORNEO EMPIEZA A LAS 23:00
          </div>
          <PhaseTimer h={restartCd.h} m={restartCd.m} s={restartCd.s} color="orange" />
          <SpainTimezoneNote className="mt-3 text-center" />
        </div>
      </PhaseCard>
    </PhaseDisplay>
  );
}
