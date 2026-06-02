"use client";

import { Pressable } from "@/components/a11y/Pressable";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { AuraScoreBadge } from "@/features/aura/components/AuraScoreBadge";
import { auraForName } from "@/lib/aura/leaderboard";
import { AURA_BOOST, AURA_PENALTY } from "@/lib/aura/constants";
import { cn } from "@/lib/cn";
import type { RankedEntry } from "@/features/rankings/lib/ranking";
import type { AuraScores } from "@/types/aura";
import { rankerProfileSlug } from "@/features/rankings/lib/profile-slug";

type AuraVoteRowProps = {
  entry: RankedEntry;
  scores: AuraScores;
  disabled: boolean;
  alreadyVoted: boolean;
  votingName: string | null;
  voteSuccessName: string | null;
  voteDelta: number | null;
  onBoost: (name: string) => void;
  onPenalty: (name: string) => void;
  onOpenProfile: (name: string, rank: number) => void;
};

export function AuraVoteRow({
  entry,
  scores,
  disabled,
  alreadyVoted,
  votingName,
  voteSuccessName,
  voteDelta,
  onBoost,
  onPenalty,
  onOpenProfile,
}: AuraVoteRowProps) {
  const { ranker, rank } = entry;
  const target = rankerProfileSlug(ranker.name);
  const aura = auraForName(scores, ranker.name);
  const busy = votingName === ranker.name;
  const justVoted = voteSuccessName === ranker.name;
  const buttonsDisabled = disabled || busy || alreadyVoted;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-lm-border bg-lm-card px-4 py-3",
        "max-md:gap-2.5 max-md:px-3.5",
        justVoted && "border-lm-gold/50 shadow-[0_0_20px_rgba(232,184,75,0.15)]",
        alreadyVoted && !justVoted && "border-lm-gold/40 bg-[rgba(232,184,75,0.06)]",
      )}
    >
      <Pressable
        id={`profile-target-${target}`}
        data-profile-target={target}
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
            <AuraScoreBadge total={aura} voteDelta={justVoted ? voteDelta : null} />
          </div>
          <div className="mt-0.5 truncate text-base font-semibold text-lm-text2">
            {ranker.title}
          </div>
          {alreadyVoted ? (
            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-lm-gold">
              <Icon name="circle-check" size={12} className="shrink-0" />
              Ya votaste a este candidato esta semana
            </p>
          ) : null}
        </div>
      </Pressable>

      <div className="relative z-[1]">
        {alreadyVoted ? (
          <div
            className={cn(
              "flex cursor-not-allowed items-center justify-center gap-2 rounded-lg",
              "border border-dashed border-lm-border2 bg-lm-bg3 px-3 py-2.5",
              "text-sm font-bold text-lm-text2 select-none",
            )}
            aria-disabled="true"
          >
            <Icon name="lock" size={14} className="shrink-0 text-lm-text2" />
            Voto registrado — no puedes votar otra vez
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={buttonsDisabled}
              aria-label={`Dar +${AURA_BOOST} aura a ${ranker.name}`}
              aria-disabled={buttonsDisabled}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(46,204,113,0.4)]",
                "bg-[rgba(46,204,113,0.12)] px-3 py-2.5 text-sm font-bold text-lm-green2 lm-focus-ring",
                "disabled:cursor-not-allowed disabled:border-lm-border disabled:bg-lm-bg3",
                "disabled:text-lm-text2 disabled:opacity-60",
                !buttonsDisabled && "cursor-pointer hover:bg-[rgba(46,204,113,0.2)]",
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (buttonsDisabled) return;
                void onBoost(ranker.name);
              }}
            >
              <Icon name="trending-up" size={14} />+{AURA_BOOST}
            </button>
            <button
              type="button"
              disabled={buttonsDisabled}
              aria-label={`Quitar ${AURA_PENALTY} aura a ${ranker.name}`}
              aria-disabled={buttonsDisabled}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(255,71,87,0.4)]",
                "bg-[rgba(255,71,87,0.12)] px-3 py-2.5 text-sm font-bold text-lm-red2 lm-focus-ring",
                "disabled:cursor-not-allowed disabled:border-lm-border disabled:bg-lm-bg3",
                "disabled:text-lm-text2 disabled:opacity-60",
                !buttonsDisabled && "cursor-pointer hover:bg-[rgba(255,71,87,0.2)]",
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (buttonsDisabled) return;
                void onPenalty(ranker.name);
              }}
            >
              <Icon name="trending-down" size={14} />-{AURA_PENALTY}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
