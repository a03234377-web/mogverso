"use client";

import { Icon, IconLabel } from "@/components/icons";
import { CountdownDigits } from "@/features/shared/components/ui/CountdownDigits";
import { FighterCard } from "./FighterCard";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { RANKERS } from "@/features/rankings/data/rankers";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { cn } from "@/lib/cn";

export function RankVoteArena({
  rv,
  myVote,
  overrides,
  fb,
  voting,
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
  onVote: (name: string) => void;
}) {
  const cd = useCountdown(rv.endTime);
  const v1 = rv.votes?.[rv.p1] ?? 0;
  const v2 = rv.votes?.[rv.p2] ?? 0;
  const total = Math.max(1, v1 + v2);
  const pct1 = Math.round((v1 / total) * 100);
  const pct2 = 100 - pct1;
  const r1 = RANKERS.find((r) => r.name === rv.p1) ?? {
    name: rv.p1,
    score: 0,
    sub: "España",
  };
  const r2 = RANKERS.find((r) => r.name === rv.p2) ?? {
    name: rv.p2,
    score: 0,
    sub: "España",
  };
  const ranked = fb
    ? fb.getRankedNamesFromOverrides(overrides)
    : RANKERS.map((r) => r.name);
  const idx1 = ranked.indexOf(rv.p1) + 1;
  const idx2 = ranked.indexOf(rv.p2) + 1;
  const voted = myVote?.rvId === rv.id;
  const myCandidate = voted ? myVote.candidate : null;
  const canVote = !voted && !voting;

  return (
    <>
      <div
        className={cn(
          "mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-1",
          "rounded-full border border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.12)]",
          "px-3 py-1 font-sans text-sm font-bold tracking-wide text-lm-green2 uppercase",
        )}
      >
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-green2" />
        VOTACIÓN EN DIRECTO · 3 HORAS
      </div>
      <div className="mb-0.5 font-sans text-xl font-bold tracking-tight text-lm-text lg:text-2xl">
        ¿Quién merece subir en el ranking?
      </div>
      <div className="mb-5 text-base font-semibold text-lm-text2">
        Vota cada 3 horas · El ganador sube 1 puesto · El perdedor baja 1 puesto
      </div>
      <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="green" className="mb-6" />
      <div
        className={cn(
          "mx-auto mb-5 grid max-w-[700px] grid-cols-[1fr_auto_1fr] items-center gap-4",
          "max-md:max-w-full max-md:gap-2",
        )}
      >
        <FighterCard
          side="up"
          name={rv.p1}
          ranker={r1}
          idx={idx1}
          pct={pct1}
          votes={v1}
          voted={voted}
          canVote={canVote}
          selected={myCandidate === rv.p1}
          onVote={() => onVote(rv.p1)}
        />
        <div className="w-fit shrink-0 font-sans text-2xl font-bold tracking-tight text-lm-gold max-md:text-xl">
          VS
        </div>
        <FighterCard
          side="down"
          name={rv.p2}
          ranker={r2}
          idx={idx2}
          pct={pct2}
          votes={v2}
          voted={voted}
          canVote={canVote}
          selected={myCandidate === rv.p2}
          onVote={() => onVote(rv.p2)}
        />
      </div>
      <div className="mt-1 text-center" id="rvAction">
        {voted ? (
          <div className="flex items-center justify-center gap-1.5 text-base font-bold text-lm-green2">
            <Icon name="circle-check" size={16} />
            Votaste por <strong>{myCandidate}</strong> · El ranking se actualiza al
            terminar
          </div>
        ) : voting ? (
          <div className="flex items-center justify-center gap-1.5 text-base text-lm-text2">
            <Icon name="hourglass" size={14} />
            Enviando voto…
          </div>
        ) : (
          <div className="text-base font-semibold text-lm-text2">
            <IconLabel icon="pointer" iconSize={12} className="justify-center">
              Toca el nombre para votar · 1 voto por dispositivo/IP
            </IconLabel>
          </div>
        )}
      </div>
      <div className="mt-2.5 text-sm font-semibold text-lm-text2">
        <IconLabel icon="vote" iconSize={12} className="justify-center">
          1 voto por dispositivo e IP · Ranking actualizado automáticamente · Nueva
          ronda cada 3 horas
        </IconLabel>
      </div>
    </>
  );
}
