"use client";

import { CreatorImage } from "@/components/CreatorImage";
import { SpainTimezoneNote } from "@/components/ui/SpainTimezoneNote";
import { CreatorIcon, Icon } from "@/components/icons";
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
import {
  TORNEO_CHAMPION_RANK_BOOST,
  type TorneoChampionResult,
} from "@/lib/torneo-champion-prize";
import {
  TORNEO_PRESTART_BRACKET,
  TORNEO_PRESTART_FIRST_ROUND,
  TORNEO_PRESTART_FOOTER,
  TORNEO_PRESTART_HEADLINE,
  TORNEO_PRESTART_LABEL,
} from "@/features/torneo/components/torneo-prestart-copy";
import { formatSpainTime, formatSpainWeekdayDate } from "@/lib/spain-time";

export function TorneoPhaseWaitingOctavos({
  cd,
  targetMs,
}: {
  state: TorneoState;
  cd: CountdownParts;
  targetMs: number;
}) {
  const horaStr = formatSpainTime(targetMs);
  const { weekday: diaStr, dateLabel } = formatSpainWeekdayDate(targetMs);
  const diaCompleto = `${diaStr} ${dateLabel}`;
  return (
    <PhaseDisplay>
      <PhaseCard variant="waiting">
        <PhaseLabel color="orange">{TORNEO_PRESTART_LABEL}</PhaseLabel>
        <div className="my-1 font-display text-[clamp(0.9rem,2.5vw,1.3rem)] tracking-[3px] text-lm-text2">
          Torneo de LooksMaxing
        </div>
        <PhaseTitle color="orange" className="text-[clamp(2rem,6vw,4.5rem)]">
          {cd.expired ? "ARRANCANDO OCTAVOS" : TORNEO_PRESTART_HEADLINE}
        </PhaseTitle>
        <div className="mb-2 text-center text-base font-bold text-lm-text2">
          {TORNEO_PRESTART_FIRST_ROUND}
        </div>
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
        <div className="mb-3.5 text-center text-base leading-snug font-bold text-lm-text2">
          <Icon
            name="calendar"
            size={14}
            className="mr-1 inline shrink-0 align-middle"
          />
          {diaCompleto}
        </div>
        {cd.expired ? (
          <PhaseSub className="mt-2 mb-0 text-lm-orange">
            Preparando el top 16 y los duelos… Si tarda, recarga la página.
          </PhaseSub>
        ) : (
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="orange" />
        )}
        {!cd.expired ? (
          <PhaseSub className="mt-3 mb-0">
            <Icon name="zap" size={14} className="mr-1 inline shrink-0 align-middle" />
            {TORNEO_PRESTART_BRACKET}
            <br />
            {TORNEO_PRESTART_FOOTER} {horaStr}
          </PhaseSub>
        ) : null}
        <SpainTimezoneNote className="mt-3 text-center" />
      </PhaseCard>
    </PhaseDisplay>
  );
}

export function TorneoPhaseChampionReveal({
  result,
  prizeCd,
  pendingHeal,
}: {
  result: TorneoChampionResult;
  prizeCd: CountdownParts;
  pendingHeal?: boolean;
}) {
  const champInfo = getPlayerByName(result.champion);

  return (
    <PhaseDisplay>
      <PhaseCard variant="semifinals">
        <PhaseLabel color="gold" pulse>
          <Icon name="crown" size={14} className="mr-1 inline shrink-0 align-middle" />
          {pendingHeal ? "VOTACIÓN CERRADA · CORONANDO CAMPEÓN" : "CAMPEÓN DEL TORNEO"}
          <Icon name="crown" size={14} className="ml-1 inline shrink-0 align-middle" />
        </PhaseLabel>
        <div className="my-5 flex flex-col items-center gap-4">
          <div className="relative size-[clamp(7rem,22vw,9.5rem)] overflow-hidden rounded-full border-4 border-lm-gold shadow-[0_0_32px_rgba(232,184,75,0.35)]">
            <CreatorImage
              src={champInfo.photo}
              alt={result.champion}
              className="object-cover"
              sizes="152px"
              fallback={
                <CreatorIcon name={result.champion} icon={champInfo.icon} size={56} />
              }
            />
          </div>
          <div
            className={cn(
              "mx-auto w-fit max-w-full px-2 font-display text-transparent",
              "bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text",
              "text-[clamp(2.4rem,9vw,5rem)] leading-none tracking-[3px]",
            )}
          >
            {result.champion}
          </div>
          <div className="rounded-full border border-lm-gold/40 bg-lm-gold/10 px-4 py-1.5 text-sm font-black tracking-wide text-lm-gold uppercase">
            {result.championVotes} votos · {result.runnerUp} {result.runnerUpVotes}
          </div>
        </div>
        {pendingHeal ? (
          <PhaseSub className="mb-0 text-lm-gold">
            Actualizando el torneo en unos segundos…
          </PhaseSub>
        ) : (
          <>
            <PhaseSub className="mb-1">
              Premio: sube <strong>{TORNEO_CHAMPION_RANK_BOOST} puestos</strong> en el
              ranking oficial
            </PhaseSub>
            <p className="mb-4 text-xs font-semibold text-lm-text2">
              El boost se aplica cuando termine la cuenta atrás
            </p>
            <PhaseTimer h={prizeCd.h} m={prizeCd.m} s={prizeCd.s} color="gold" />
          </>
        )}
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
        <div className="mb-2.5 flex items-center justify-center gap-2 lm-type-label text-lm-gold max-md:text-base">
          <Icon name="trophy" size={14} />
          TORNEO FINALIZADO
          <Icon name="trophy" size={14} />
        </div>
        <PhaseTitle color="gold">
          <Icon
            name="crown"
            size={18}
            className="mr-1.5 inline shrink-0 align-middle"
          />
          CAMPEÓN
        </PhaseTitle>
        <PhaseSub>
          Premio entregado · +{TORNEO_CHAMPION_RANK_BOOST} puestos en el ranking
        </PhaseSub>
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
            PRÓXIMO TORNEO · MIÉRCOLES 22:40
          </div>
          <PhaseTimer h={restartCd.h} m={restartCd.m} s={restartCd.s} color="orange" />
          <SpainTimezoneNote className="mt-3 text-center" />
        </div>
      </PhaseCard>
    </PhaseDisplay>
  );
}
