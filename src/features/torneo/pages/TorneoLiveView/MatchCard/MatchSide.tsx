"use client";

import { CreatorImage } from "@/features/shared/components/CreatorImage";
import { CreatorIcon, Icon } from "@/components/icons";
import type { CreatorPhoto } from "@/assets/creators";
import type { IconName } from "@/types/icons";
import { cn } from "@/lib/cn";

export function MatchSide({
  player,
  info,
  pct,
  votes,
  showBars,
  canVote,
  isWinner,
  isLoser,
  votedFor,
  onVote,
}: {
  player: string;
  info: { photo: CreatorPhoto; icon: IconName };
  pct: number;
  votes: number;
  showBars: boolean;
  canVote: boolean;
  isWinner: boolean;
  isLoser: boolean;
  votedFor: boolean;
  onVote: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!canVote}
      aria-label={`Votar por ${player}`}
      aria-pressed={votedFor}
      className={cn(
        "relative block w-full rounded-xl border-2 border-lm-border bg-lm-bg3",
        "px-2.5 py-2.5 text-center lm-focus-ring transition-all duration-200",
        "max-md:px-2.5 max-md:py-3",
        !canVote && "lm-vote-disabled cursor-not-allowed",
        canVote && "cursor-pointer hover:-translate-y-0.5",
        isWinner &&
          "border-lm-gold2 bg-[rgba(232,184,75,0.12)] shadow-[0_0_16px_rgba(232,184,75,0.2)]",
        isLoser && "border-[rgba(255,71,87,0.35)] opacity-70",
        votedFor && "border-lm-green2 bg-[rgba(46,204,113,0.1)]",
      )}
      onClick={() => onVote()}
    >
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
          "border-2 border-lm-border bg-lm-bg2 text-[1.3rem]",
          "max-md:h-[46px] max-md:w-[46px]",
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
      <div className="mb-0.5 font-sans text-base font-bold tracking-tight text-lm-text max-md:text-base">
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
          <div className="text-sm font-bold text-lm-green2">{pct}%</div>
          <div className="text-sm text-lm-text2">
            {votes} voto{votes !== 1 ? "s" : ""}
          </div>
        </>
      ) : canVote ? (
        <div className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-lm-green2">
          <Icon name="pointer" size={12} />
          Votar
        </div>
      ) : null}
    </button>
  );
}
