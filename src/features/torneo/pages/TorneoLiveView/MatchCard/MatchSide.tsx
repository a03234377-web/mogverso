"use client";

import { CreatorImage } from "@/components/CreatorImage";
import { CreatorIcon, Icon } from "@/components/icons";
import type { CreatorPhoto } from "@/assets/creators";
import type { IconName } from "@/types/icons";
import { cn } from "@/lib/cn";

export type MatchSideHighlight = "winner" | "loser" | "voted" | "leading";

export function MatchSide({
  player,
  info,
  pct,
  votes,
  showBars,
  canVote,
  highlight,
  votedInMatch,
  onVote,
}: {
  player: string;
  info: { photo: CreatorPhoto; icon: IconName };
  pct: number;
  votes: number;
  showBars: boolean;
  canVote: boolean;
  highlight?: MatchSideHighlight | null;
  votedInMatch?: boolean;
  onVote: () => void;
}) {
  const isWinner = highlight === "winner";
  const isLoser = highlight === "loser";
  const votedFor = highlight === "voted";
  const isLeading = highlight === "leading";

  return (
    <button
      type="button"
      disabled={!canVote}
      aria-label={`Votar por ${player}`}
      aria-pressed={votedFor}
      className={cn(
        "group relative block w-full rounded-xl border-2 border-lm-border bg-lm-bg3",
        "px-2.5 py-2.5 text-center lm-focus-ring transition-all duration-250",
        "max-md:px-2.5 max-md:py-3",
        !canVote && votedInMatch && "cursor-not-allowed disabled:cursor-not-allowed",
        !canVote && !votedInMatch && "lm-vote-disabled disabled:cursor-not-allowed",
        canVote &&
          "cursor-pointer hover:-translate-y-1 hover:border-[rgba(46,204,113,0.8)] hover:bg-[rgba(46,204,113,0.16)] hover:shadow-[0_0_28px_rgba(46,204,113,0.4)] hover:ring-2 hover:ring-[rgba(46,204,113,0.35)] active:translate-y-0 active:scale-[0.98]",
        isWinner &&
          "border-lm-gold2 bg-[rgba(232,184,75,0.12)] shadow-[0_0_16px_rgba(232,184,75,0.2)]",
        isLoser && "border-[rgba(255,71,87,0.35)] opacity-70",
        votedFor &&
          "border-lm-green2 bg-[rgba(46,204,113,0.14)] shadow-[0_0_20px_rgba(46,204,113,0.3)] ring-2 ring-[rgba(46,204,113,0.25)]",
        votedInMatch &&
          !votedFor &&
          !isWinner &&
          !isLoser &&
          "opacity-80 saturate-[0.85]",
      )}
      onClick={() => onVote()}
    >
      {votedFor && (
        <span
          className={cn(
            "absolute top-1.5 left-1.5 rounded-full border border-[rgba(46,204,113,0.55)]",
            "bg-[rgba(46,204,113,0.2)] px-1.5 py-px text-[10px] font-black tracking-wide text-lm-green2 uppercase",
          )}
        >
          Tu voto
        </span>
      )}
      {isLeading && !votedFor && (
        <Icon
          name="trending-up"
          size={14}
          className="absolute top-1.5 right-1.5 text-lm-gold"
          aria-hidden
        />
      )}
      {isWinner && (
        <div
          className={cn(
            "absolute -top-1.5 -right-1.5 flex h-[22px] w-[22px] items-center justify-center",
            "rounded-full bg-lm-gold2 text-black",
          )}
        >
          <Icon name="crown" size={12} />
        </div>
      )}
      <div
        className={cn(
          "relative mx-auto mb-1.5 h-[50px] w-[50px] overflow-hidden rounded-full",
          "border-2 border-lm-border bg-lm-bg2 text-[1.3rem] transition-all duration-250",
          "max-md:h-[46px] max-md:w-[46px]",
          canVote &&
            "group-hover:scale-105 group-hover:border-lm-green2 group-hover:shadow-[0_0_14px_rgba(46,204,113,0.55)]",
        )}
      >
        <CreatorImage
          src={info.photo}
          alt={player}
          className="rounded-full object-cover"
          sizes="50px"
          fallback={<CreatorIcon name={player} icon={info.icon} size={22} />}
        />
      </div>
      <div
        className={cn(
          "mb-0.5 font-sans text-base font-bold tracking-tight text-lm-text transition-colors duration-250 max-md:text-lg",
          canVote && "group-hover:text-white",
        )}
      >
        {player}
      </div>
      {showBars ? (
        <>
          <div className="my-1 h-1 overflow-hidden rounded-full bg-white/6">
            <div
              className={cn(
                "h-full rounded-full bg-[linear-gradient(90deg,var(--color-lm-green2),#52f0a8)]",
                "transition-[width] duration-800",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-base font-bold text-lm-green2">{pct}%</div>
          <div className="text-base text-lm-text2">
            {votes} voto{votes !== 1 ? "s" : ""}
          </div>
        </>
      ) : canVote ? (
        <div
          className={cn(
            "mt-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1",
            "text-base font-bold text-lm-green2",
          )}
        >
          <Icon name="pointer" size={14} />
          Votar
        </div>
      ) : votes > 0 || showBars ? (
        <div className="mt-1 text-base font-bold text-lm-text2">
          {votes} voto{votes !== 1 ? "s" : ""}
        </div>
      ) : null}
    </button>
  );
}
