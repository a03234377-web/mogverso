"use client";

import { Icon } from "@/components/icons";
import { CountdownDigits } from "@/components/ui/CountdownDigits";
import { FighterCard } from "./FighterCard";
import { useCountdown } from "@/hooks/useCountdown";
import { RANKERS } from "@/features/rankings/data/rankers";
import {
  isKnownRankerName,
  safeRankerLabel,
} from "@/features/rankings/lib/ranker-name";
import { coerceVoteCount } from "@/lib/coerce-vote-count";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { cn } from "@/lib/cn";

export function RankVoteArena({
  rv,
  myVote,
  overrides,
  fb,
  voting,
  voteError,
  onVote,
}: {
  rv: {
    id: string;
    p1: string;
    p2: string;
    votes?: Record<string, number>;
    endTime: number;
  };
  myVote: { rvId: string; candidate: string } | null;
  overrides: Record<string, number>;
  fb: ReturnType<typeof useFirebase>["fb"];
  voting: boolean;
  voteError: string | null;
  onVote: (name: string) => void;
}) {
  const cd = useCountdown(rv.endTime);
  const v1 = coerceVoteCount(rv.votes?.[rv.p1]);
  const v2 = coerceVoteCount(rv.votes?.[rv.p2]);
  const total = Math.max(1, v1 + v2);
  const pct1 = Math.round((v1 / total) * 100);
  const pct2 = 100 - pct1;
  const displayP1 = safeRankerLabel(rv.p1);
  const displayP2 = safeRankerLabel(rv.p2);
  const r1 = RANKERS.find((r) => r.name === rv.p1) ?? {
    name: displayP1,
    score: 0,
    sub: "España",
  };
  const r2 = RANKERS.find((r) => r.name === rv.p2) ?? {
    name: displayP2,
    score: 0,
    sub: "España",
  };
  const ranked = fb
    ? fb.getRankedNamesFromOverrides(overrides)
    : RANKERS.map((r) => r.name);
  const idx1 = ranked.indexOf(rv.p1) + 1;
  const idx2 = ranked.indexOf(rv.p2) + 1;
  const voted = myVote?.rvId === rv.id;
  const myCandidate =
    voted && myVote.candidate && isKnownRankerName(myVote.candidate)
      ? myVote.candidate
      : null;
  const canVote = !voted && !voting;

  return (
    <>
      <div
        className={cn(
          "mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-1",
          "rounded-full border border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.12)]",
          "px-3 py-1 font-sans text-sm font-bold tracking-wide text-lm-green2 uppercase max-md:text-base",
        )}
      >
        <div className="size-[7px] animate-pulse-soft rounded-full bg-lm-green2" />
        VOTACIÓN EN DIRECTO <span className="max-sm:hidden">·</span>
        <hr className="sm:hidden" />3 HORAS
      </div>

      <div className="mb-0.5 font-sans text-xl font-bold tracking-tight text-lm-text max-md:text-[clamp(1.25rem,3vw,1.75rem)] lg:text-2xl">
        ¿Quién merece subir en el ranking?
      </div>

      <div className="mb-5 text-base font-semibold text-lm-text2">
        Vota cada 3 horas · El ganador sube 1 puesto · El perdedor baja 1 puesto
      </div>

      <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="green" className="mb-6" />

      <div
        className={cn(
          "mx-auto mb-5 grid max-w-[700px] grid-cols-[1fr_auto_1fr] items-center gap-4",
          "max-md:max-w-full max-md:gap-2 max-sm:grid-cols-[1fr]",
        )}
      >
        <FighterCard
          side="up"
          name={displayP1}
          photoName={rv.p1}
          ranker={r1}
          idx={idx1}
          pct={pct1}
          votes={v1}
          voted={voted}
          canVote={canVote && isKnownRankerName(rv.p1)}
          selected={myCandidate === rv.p1}
          onVote={() => onVote(rv.p1)}
        />

        <div className="w-fit shrink-0 font-sans text-2xl font-bold tracking-tight text-lm-gold max-md:text-xl max-sm:w-full max-sm:text-center">
          VS
        </div>

        <FighterCard
          side="down"
          name={displayP2}
          photoName={rv.p2}
          ranker={r2}
          idx={idx2}
          pct={pct2}
          votes={v2}
          voted={voted}
          canVote={canVote && isKnownRankerName(rv.p2)}
          selected={myCandidate === rv.p2}
          onVote={() => onVote(rv.p2)}
        />
      </div>

      <div className="mt-1 text-center" id="rvAction">
        {voteError ? (
          <div className="mx-auto mb-2 max-w-md rounded-lg border border-lm-red2/35 bg-lm-red2/10 px-3 py-2 text-base leading-snug font-semibold text-lm-red2">
            {voteError}
          </div>
        ) : null}
        {voted ? (
          <div className="text-center text-base leading-snug font-bold text-lm-green2">
            <Icon
              name="circle-check"
              size={16}
              className="mr-2 inline shrink-0 align-middle"
            />

            {myCandidate ? (
              <>
                Votaste por <strong>{myCandidate}</strong> · El ranking se actualiza al
                terminar
              </>
            ) : (
              <>Voto registrado · El ranking se actualiza al terminar</>
            )}
          </div>
        ) : voting ? (
          <div className="text-center text-base leading-snug text-lm-text2">
            <Icon
              name="hourglass"
              size={14}
              className="mr-1 inline shrink-0 align-middle"
            />
            Enviando voto…
          </div>
        ) : (
          <div className="text-center text-base leading-snug font-semibold text-lm-text2">
            <Icon
              name="pointer"
              size={14}
              className="mr-1 inline shrink-0 align-middle"
            />
            Toca el nombre para votar · 1 voto por dispositivo/IP
          </div>
        )}
      </div>

      <div className="mt-2.5 text-center text-base leading-snug font-semibold text-lm-text2">
        <Icon name="vote" size={14} className="mr-1 inline shrink-0 align-middle" />1
        voto por dispositivo e IP · Ranking actualizado automáticamente · Nueva ronda
        cada 3 horas
      </div>
    </>
  );
}
