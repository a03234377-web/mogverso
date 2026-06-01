"use client";

import { Pressable } from "@/components/a11y/Pressable";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { auraForName } from "@/lib/aura/leaderboard";
import { AURA_BOOST, AURA_PENALTY } from "@/lib/aura/constants";
import { cn } from "@/lib/cn";
import type { RankedEntry } from "@/features/rankings/lib/ranking";
import type { AuraScores } from "@/types/aura";

type AuraVoteRowProps = {
  entry: RankedEntry;
  scores: AuraScores;
  disabled: boolean;
  votingName: string | null;
  onBoost: (name: string) => void;
  onPenalty: (name: string) => void;
  onOpenProfile: (name: string, rank: number) => void;
};

export function AuraVoteRow({
  entry,
  scores,
  disabled,
  votingName,
  onBoost,
  onPenalty,
  onOpenProfile,
}: AuraVoteRowProps) {
  const { ranker, rank } = entry;
  const aura = auraForName(scores, ranker.name);
  const busy = votingName === ranker.name;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-lm-border bg-lm-card px-4 py-3",
        "max-md:gap-2.5 max-md:px-3.5",
      )}
    >
      <Pressable
        aria-label={`Ver perfil de ${ranker.name}`}
        className={cn(
          "flex min-w-0 items-center gap-3 text-left select-none",
          "[&>*]:relative",
        )}
        onClick={() => onOpenProfile(ranker.name, rank - 1)}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-lm-bg3 lm-type-score text-[1.05rem] text-lm-text2">
          {rank}
        </div>
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-lm-border bg-lm-bg3">
          <Avatar name={ranker.name} size={40} fit="contain" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-base font-bold">
            {ranker.name}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-[rgba(232,184,75,0.35)]",
                "bg-[rgba(232,184,75,0.12)] px-2 py-0.5 text-sm font-black text-lm-gold",
              )}
            >
              <Icon name="sparkles" size={12} className="text-lm-gold" />
              {aura.toLocaleString("es-ES")} aura
            </span>
          </div>
          <div className="mt-0.5 truncate text-base font-semibold text-lm-text2">
            {ranker.title}
          </div>
        </div>
      </Pressable>

      <div className="grid grid-cols-2 gap-2">
        <Pressable
          type="button"
          disabled={disabled || busy}
          aria-label={`Dar +${AURA_BOOST} aura a ${ranker.name}`}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(46,204,113,0.4)]",
            "bg-[rgba(46,204,113,0.12)] px-3 py-2.5 text-sm font-bold text-lm-green2 lm-focus-ring",
            "disabled:cursor-not-allowed disabled:opacity-45",
            !disabled && !busy && "hover:bg-[rgba(46,204,113,0.2)]",
          )}
          onClick={() => onBoost(ranker.name)}
        >
          <Icon name="trending-up" size={14} />+{AURA_BOOST}
        </Pressable>
        <Pressable
          type="button"
          disabled={disabled || busy}
          aria-label={`Quitar ${AURA_PENALTY} aura a ${ranker.name}`}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(255,71,87,0.4)]",
            "bg-[rgba(255,71,87,0.12)] px-3 py-2.5 text-sm font-bold text-lm-red2 lm-focus-ring",
            "disabled:cursor-not-allowed disabled:opacity-45",
            !disabled && !busy && "hover:bg-[rgba(255,71,87,0.2)]",
          )}
          onClick={() => onPenalty(ranker.name)}
        >
          <Icon name="trending-down" size={14} />-{AURA_PENALTY}
        </Pressable>
      </div>
    </div>
  );
}
