"use client";

import { Icon } from "@/components/icons";
import type { IconName } from "@/types/icons";
import { getPlayerByName, PHASES } from "@/features/torneo/data/torneo-players";
import { MatchSide } from "./MatchSide";
import type { TorneoMatch, TorneoState } from "@/features/shared/lib/types";
import { cn } from "@/lib/cn";

export function MatchCard({
  match,
  idx,
  round,
  state,
  myVote,
  onVote,
}: {
  match: TorneoMatch;
  idx: number;
  round: string;
  state: TorneoState;
  myVote: string | null;
  onVote: (name: string) => void;
}) {
  const p1 = getPlayerByName(match.p1);
  const p2 = getPlayerByName(match.p2);
  const v1 = match.votes?.[match.p1] ?? 0;
  const v2 = match.votes?.[match.p2] ?? 0;
  const total = Math.max(1, v1 + v2);
  const pct1 = Math.round((v1 / total) * 100);
  const pct2 = 100 - pct1;
  const isResolved = !!(match.resolved && match.winner);
  const isVotingPhase =
    (state.phase === PHASES.CUARTOS_VOTING && round === "cuartos") ||
    (state.phase === PHASES.SEMIFINALS_VOTING && round === "semis") ||
    (state.phase === PHASES.FINAL_VOTING && round === "final");
  const canVote = isVotingPhase && !isResolved && !myVote;
  const showBars = isResolved || !!myVote;
  const roundIcon: IconName =
    round === "cuartos" ? "landmark" : round === "semis" ? "trophy" : "crown";
  const roundLabel =
    round === "cuartos" ? "Cuartos" : round === "semis" ? "Semifinal" : "Gran Final";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-lm-border bg-lm-card",
        "px-5 py-4 transition-colors duration-300",
        isVotingPhase && !isResolved && "border-[rgba(46,204,113,0.45)]",
        isResolved && "border-[rgba(232,184,75,0.35)]",
      )}
      data-matchid={match.id}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1 lm-type-label text-lm-text2">
          <Icon name={roundIcon} size={12} />
          {roundLabel} · Partido {idx + 1}
        </span>
        {isResolved ? (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full border border-[rgba(232,184,75,0.4)]",
              "bg-[rgba(232,184,75,0.15)] px-2 py-0.5 text-sm font-black tracking-wide text-lm-gold",
            )}
          >
            <Icon name="circle-check" size={12} />
            Terminado
          </span>
        ) : isVotingPhase ? (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full border border-[rgba(46,204,113,0.4)]",
              "bg-[rgba(46,204,113,0.15)] px-2 py-0.5 text-sm font-black tracking-wide text-lm-green2",
            )}
          >
            <Icon name="radio" size={12} className="text-lm-red2" />
            EN VIVO
          </span>
        ) : (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full border border-lm-border",
              "bg-[rgba(150,150,150,0.1)] px-2 py-0.5 text-sm font-black tracking-wide text-lm-text2",
            )}
          >
            <Icon name="hourglass" size={12} />
            Pendiente
          </span>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 max-md:gap-2">
        <MatchSide
          player={match.p1}
          info={p1}
          pct={pct1}
          votes={v1}
          showBars={showBars}
          canVote={canVote}
          isWinner={!!(isResolved && match.winner === match.p1)}
          isLoser={!!(isResolved && match.winner !== match.p1)}
          votedFor={myVote === match.p1}
          onVote={() => onVote(match.p1)}
        />
        <div
          className={cn(
            "shrink-0 bg-clip-text lm-type-score text-xl text-transparent",
            "bg-[linear-gradient(135deg,var(--color-lm-green2),var(--color-lm-gold))]",
          )}
        >
          VS
        </div>
        <MatchSide
          player={match.p2}
          info={p2}
          pct={pct2}
          votes={v2}
          showBars={showBars}
          canVote={canVote}
          isWinner={!!(isResolved && match.winner === match.p2)}
          isLoser={!!(isResolved && match.winner !== match.p2)}
          votedFor={myVote === match.p2}
          onVote={() => onVote(match.p2)}
        />
      </div>
      {myVote && !isResolved && (
        <div className="mt-2 text-center text-sm font-bold text-lm-green2">
          <Icon name="circle-check" size={14} className="inline" /> Votaste por{" "}
          <strong>{myVote}</strong>
        </div>
      )}
      {isResolved && match.winner && (
        <div
          className={cn(
            "mt-2.5 rounded-[10px] border-[1.5px] border-[rgba(232,184,75,0.6)]",
            "bg-[rgba(232,184,75,0.15)] px-4 py-2 text-center lm-type-label text-lm-gold",
          )}
        >
          <Icon name="trophy" size={14} className="inline text-lm-gold" /> GANADOR ·{" "}
          <span className="mt-0.5 block font-sans text-base font-bold tracking-tight text-white">
            {match.winner}
          </span>
        </div>
      )}
    </div>
  );
}
