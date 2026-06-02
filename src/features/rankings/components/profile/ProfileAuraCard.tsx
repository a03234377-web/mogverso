"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { auraPathWithVoteTarget } from "@/features/app/routes";
import { profileTargetId } from "@/features/rankings/lib/profile-slug";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";
import { AuraScoreBadge } from "@/features/aura/components/AuraScoreBadge";
import { AURA_RANKING_SIZE } from "@/lib/aura/constants";
import { computeAuraStanding } from "@/lib/aura/leaderboard";
import { cn } from "@/lib/cn";
import { useMemo } from "react";

type ProfileAuraCardProps = {
  name: string;
};

export function ProfileAuraCard({ name }: ProfileAuraCardProps) {
  const { entries, ready, auraScores } = useRankingData();

  const rankedNames = useMemo(() => entries.map((e) => e.name), [entries]);

  const standing = useMemo(
    () => computeAuraStanding(rankedNames, auraScores, name),
    [rankedNames, auraScores, name],
  );

  return (
    <div
      className={cn(
        "rounded-[14px] border border-lm-border bg-lm-card p-5",
        "transition-all duration-300 hover:border-lm-border2",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-base font-bold text-lm-text">
          <Icon name="sparkles" size={16} className="text-lm-gold" /> Aura
        </div>
        {!ready ? (
          <span className="text-sm font-bold text-lm-text2">Votar aura →</span>
        ) : standing.eligible ? (
          <Link
            href={auraPathWithVoteTarget(name, profileTargetId(name))}
            className={cn(
              "text-sm font-bold text-lm-gold underline-offset-2 lm-focus-ring",
              "rounded-sm hover:underline",
            )}
          >
            Votar aura →
          </Link>
        ) : (
          <span className="text-sm font-bold text-lm-text2">Fuera del top de aura</span>
        )}
      </div>

      {!ready ? (
        <div className="h-14 animate-pulse rounded-lg bg-lm-bg3" aria-hidden />
      ) : (
        <div className="flex flex-col gap-3">
          <AuraScoreBadge
            total={standing.aura}
            iconSize={16}
            className="[&_span:first-child]:px-3 [&_span:first-child]:py-1 [&_span:first-child]:lm-type-score [&_span:first-child]:text-[1.35rem]"
          />

          {standing.eligible && standing.auraRank != null ? (
            <p className="font-serif text-base leading-relaxed text-lm-text2">
              Puesto{" "}
              <strong className="font-sans font-bold text-lm-text">
                #{standing.auraRank}
              </strong>{" "}
              de {AURA_RANKING_SIZE} en la votación de aura del mes (top del ranking
              oficial).
            </p>
          ) : (
            <p className="font-serif text-base leading-relaxed text-lm-text2">
              No está en el top {AURA_RANKING_SIZE} del ranking oficial; no participa en
              la votación de aura este mes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
