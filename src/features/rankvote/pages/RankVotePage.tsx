"use client";

import { Avatar } from "@/features/shared/components/Avatar";
import { Icon, IconLabel } from "@/components/icons";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { CountdownDigits } from "@/features/shared/components/ui/CountdownDigits";
import { HeroSection } from "@/features/shared/components/ui/HeroSection";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { useRankVote } from "@/features/rankvote/hooks/useRankVote";
import { RANKERS } from "@/features/rankings/data/rankers";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { cn } from "@/lib/cn";

export function RankVotePage() {
  const { fb } = useFirebase();
  const { rv, myVote, overrides, history, loading, transitioning, voting, vote } =
    useRankVote(true);

  return (
    <ActivePage id="page-rankvote" active>
      <HeroSection
        variant="rankvote"
        title={
          <>
            <IconLabel icon="vote" iconSize={28} className="justify-center">
              Votar
            </IconLabel>
            <br />
            Ranking
          </>
        }
        subtitle="Vota cada 6 horas · El ganador sube 1 puesto · El perdedor baja 1 puesto"
      />
      <div className="mx-auto max-w-[1000px] px-5 pb-16 max-md:px-3 max-md:pb-[5.5rem]">
        <div
          className="relative mb-8 overflow-hidden rounded-[20px] border border-[rgba(46,204,113,0.3)] bg-[linear-gradient(135deg,rgba(46,204,113,0.07),rgba(232,184,75,0.04))] px-6 py-8 text-center max-md:mb-5 max-md:rounded-2xl max-md:px-3.5 max-md:py-5"
          id="rankvoteArena"
        >
          {loading || transitioning ? (
            <div className="px-6 py-12 text-center text-base font-bold text-lm-gold">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin-slow rounded-full border-[3px] border-[rgba(232,184,75,0.2)] border-t-lm-gold" />
              {transitioning ? (
                <IconLabel icon="circle-check" iconSize={16} className="justify-center">
                  Ronda resuelta · Cargando nueva votación…
                </IconLabel>
              ) : (
                <IconLabel icon="hourglass" iconSize={16} className="justify-center">
                  Cargando votación…
                </IconLabel>
              )}
            </div>
          ) : rv ? (
            <RankVoteArena
              rv={rv}
              myVote={myVote}
              overrides={overrides}
              fb={fb}
              voting={voting}
              onVote={(name) => void vote(name)}
            />
          ) : (
            <div className="flex items-center justify-center gap-2 px-6 py-12 text-center text-lm-text2">
              <Icon name="hourglass" size={16} />
              Cargando votación…
            </div>
          )}
        </div>
        <div>
          <div className="mb-4 flex items-center gap-2 font-display text-[1.4rem] tracking-[2px] text-lm-text">
            <Icon name="scroll-text" size={22} className="text-lm-gold" />
            Historial de Votaciones
          </div>
          <div id="rankvoteHistoryList">
            {history.length === 0 ? (
              <div className="px-6 py-6 text-center text-base text-lm-text2">
                No hay votaciones resueltas aún · ¡Participa en la primera!
              </div>
            ) : (
              history.map((h, i) => <HistoryRow key={i} h={h} />)
            )}
          </div>
        </div>
      </div>
    </ActivePage>
  );
}

function RankVoteArena({
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
      <div className="mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-full border border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.12)] px-3 py-1 text-sm font-extrabold tracking-[1.5px] text-lm-green2 uppercase max-md:text-sm max-md:tracking-[1px]">
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-green2" />
        VOTACIÓN EN DIRECTO · 6 HORAS
      </div>
      <div className="mb-0.5 font-display text-[clamp(1.2rem,3vw,2.5rem)] tracking-[2px] text-lm-text">
        ¿Quién merece subir en el ranking?
      </div>
      <div className="mb-5 text-base font-semibold text-lm-text2">
        Vota cada 6 horas · El ganador sube 1 puesto · El perdedor baja 1 puesto
      </div>
      <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="green" className="mb-6" />
      <div className="mx-auto mb-5 grid max-w-[700px] grid-cols-[1fr_auto_1fr] items-center gap-4 max-md:max-w-full max-md:gap-2">
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
        <div className="w-fit shrink-0 animate-vs-pulse bg-[linear-gradient(135deg,var(--color-lm-green2),var(--color-lm-gold))] bg-clip-text font-display text-[2.5rem] tracking-[2px] text-transparent max-md:text-[2rem]">
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
          ronda cada 6 horas
        </IconLabel>
      </div>
    </>
  );
}

function FighterCard({
  side,
  name,
  ranker,
  idx,
  pct,
  votes,
  voted,
  canVote,
  selected,
  onVote,
}: {
  side: "up" | "down";
  name: string;
  ranker: { sub: string; score: number };
  idx: number;
  pct: number;
  votes: number;
  voted: boolean;
  canVote: boolean;
  selected: boolean;
  onVote: () => void;
}) {
  const up = side === "up";
  return (
    <button
      type="button"
      disabled={!canVote}
      aria-label={`Votar ${up ? "subir" : "bajar"} a ${name}`}
      aria-pressed={selected}
      className={cn(
        "relative block w-full overflow-hidden rounded-2xl border-2 border-lm-border bg-lm-card px-4 py-5 text-center lm-focus-ring transition-all duration-250 max-[400px]:px-1.5 max-[400px]:py-2.5 max-md:rounded-xl max-md:px-2 max-md:py-3.5",
        !canVote && "lm-vote-disabled cursor-not-allowed",
        canVote &&
          "cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        canVote &&
          up &&
          "hover:border-[rgba(46,204,113,0.7)] hover:bg-[rgba(46,204,113,0.07)]",
        canVote &&
          !up &&
          "hover:border-[rgba(255,71,87,0.7)] hover:bg-[rgba(255,71,87,0.07)]",
        selected &&
          up &&
          "-translate-y-1 border-lm-green2 bg-[rgba(46,204,113,0.13)] shadow-[0_0_28px_rgba(46,204,113,0.25)]",
        selected &&
          !up &&
          "-translate-y-1 border-lm-red2 bg-[rgba(255,71,87,0.13)] shadow-[0_0_28px_rgba(255,71,87,0.2)]",
      )}
      onClick={() => onVote()}
    >
      {selected && (
        <Icon
          name="check"
          size={18}
          className={cn(
            "absolute top-2.5 right-2.5",
            up ? "text-lm-green2" : "text-lm-red2",
          )}
        />
      )}
      <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-lm-border bg-lm-bg3 text-[2rem] max-[400px]:h-[54px] max-[400px]:w-[54px] max-[400px]:text-[1.4rem] max-md:h-16 max-md:w-16 max-md:text-[1.6rem]">
        <Avatar name={name} size={80} />
      </div>
      <div
        className={cn(
          "mb-0.5 font-display text-[1.25rem] tracking-[1.5px] max-[400px]:text-base max-md:text-base",
          up ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        {name}
      </div>
      <div className="mb-1 text-sm font-semibold text-lm-text2 max-md:text-sm">
        {ranker.sub}
      </div>
      <div className="mb-2 text-base font-extrabold text-lm-gold max-md:text-sm">
        Puesto #{idx} · Score {ranker.score}
      </div>
      <div
        className={cn(
          "mb-2 inline-block rounded-full px-2 py-0.5 text-sm font-extrabold tracking-[0.8px]",
          up
            ? "border border-[rgba(46,204,113,0.35)] bg-[rgba(46,204,113,0.15)] text-lm-green2"
            : "border border-[rgba(255,71,87,0.35)] bg-[rgba(255,71,87,0.15)] text-lm-red2",
        )}
      >
        {up ? "▲" : "▼"} {up ? "Gana" : "Pierde"} → #
        {up ? Math.max(1, idx - 1) : Math.min(RANKERS.length, idx + 1)}
      </div>
      <div className="mb-1 h-[5px] overflow-hidden rounded-full bg-white/6">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-800",
            up
              ? "bg-[linear-gradient(90deg,var(--color-lm-green2),#52f0a8)]"
              : "bg-[linear-gradient(90deg,var(--color-lm-red2),#ff8c69)]",
          )}
          style={{ width: voted ? `${pct}%` : "0%" }}
        />
      </div>
      <div
        className={cn(
          "text-base font-extrabold",
          up ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        {voted ? (
          `${pct}%`
        ) : canVote ? (
          <IconLabel icon="pointer" iconSize={12} className="justify-center">
            Votar
          </IconLabel>
        ) : (
          "—"
        )}
      </div>
      <div className="text-sm font-semibold text-lm-text2">
        {voted ? `${votes} voto${votes !== 1 ? "s" : ""}` : ""}
      </div>
    </button>
  );
}

function HistoryRow({
  h,
}: {
  h: {
    winner: string;
    loser: string;
    wVotes: number;
    lVotes: number;
    ts: number;
    winnerPos?: number;
    loserPos?: number;
    winnerNewPos?: number;
    loserNewPos?: number;
  };
}) {
  const d = new Date(h.ts);
  const fmt = d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (h.winner === "empate") {
    return (
      <div className="mb-2 flex flex-wrap items-center gap-3 rounded-[10px] border border-lm-border bg-lm-card px-4 py-3">
        <Icon name="vote" size={14} className="text-lm-text2" />
        <span className="font-bold text-lm-text2">Sin votos · Empate</span>
        <span className="text-sm font-bold text-lm-text2">0–0</span>
        <span className="text-sm font-semibold text-lm-text2">{fmt}</span>
      </div>
    );
  }

  const posW =
    h.winnerPos && h.winnerNewPos ? ` (#${h.winnerPos}→#${h.winnerNewPos})` : "";
  const posL = h.loserPos && h.loserNewPos ? ` (#${h.loserPos}→#${h.loserNewPos})` : "";

  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border border-lm-border bg-lm-card px-4 py-3 max-md:gap-2 max-md:px-3">
      <Icon name="vote" size={14} className="shrink-0 text-lm-text2" />
      <span className="text-base font-extrabold text-lm-green2">
        ▲ {h.winner}
        {posW}
      </span>
      <span className="text-base text-lm-text2">vs</span>
      <span className="text-base font-bold text-lm-red2">
        ▼ {h.loser}
        {posL}
      </span>
      <span className="text-sm font-bold text-lm-text2 max-md:basis-full max-md:text-left md:ml-auto">
        {h.wVotes}–{h.lVotes}
      </span>
      <span className="text-sm font-semibold text-lm-text2 max-md:basis-full max-md:text-left">
        {fmt}
      </span>
    </div>
  );
}
