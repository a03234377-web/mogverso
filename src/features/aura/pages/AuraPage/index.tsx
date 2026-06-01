"use client";

import { useMemo } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { IconLabel } from "@/components/icons";
import { HeroBadge, HeroSection } from "@/components/ui/HeroSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { AuraLeadersCard } from "@/features/aura/components/AuraLeadersCard";
import { AuraVoteRow } from "@/features/aura/components/AuraVoteRow";
import { useAuraQuota } from "@/features/aura/hooks/useAuraQuota";
import { useAuraScores } from "@/features/aura/hooks/useAuraScores";
import { useAuraVote } from "@/features/aura/hooks/useAuraVote";
import { useLooksMaxNavigate } from "@/features/app/shell/LooksMaxShell";
import { AURA_RANKING_SIZE, AURA_VOTES_PER_WEEK } from "@/lib/aura/constants";
import { computeAuraLeaders } from "@/lib/aura/leaderboard";
import { SPAIN_TIMEZONE_LABEL } from "@/lib/spain-time";
import type { RankedEntry } from "@/features/rankings/lib/ranking";
import { cn } from "@/lib/cn";

type AuraPageProps = {
  entries: RankedEntry[];
  rankingReady: boolean;
};

export function AuraPage({ entries, rankingReady }: AuraPageProps) {
  const { openProfile } = useLooksMaxNavigate();
  const { scores, ready: scoresReady } = useAuraScores();
  const { votesRemaining, ready: quotaReady } = useAuraQuota();
  const { votingName, voteError, castVote, clearError } = useAuraVote();

  const auraEntries = useMemo(
    () => entries.slice(0, AURA_RANKING_SIZE),
    [entries],
  );

  const rankedNames = useMemo(
    () => auraEntries.map((e) => e.name),
    [auraEntries],
  );

  const { top, bottom } = useMemo(
    () => computeAuraLeaders(rankedNames, scores),
    [rankedNames, scores],
  );

  const ready = rankingReady && scoresReady && quotaReady;
  const noVotesLeft = votesRemaining <= 0;

  const handleBoost = async (name: string) => {
    clearError();
    await castVote(name, "boost");
  };

  const handlePenalty = async (name: string) => {
    clearError();
    await castVote(name, "penalty");
  };

  return (
    <div id="page-aura" className="block animate-fade-up">
      <HeroSection
        eyebrow="Votación comunitaria"
        title={
          <>
            Aura
            <br />
            LooksMax
          </>
        }
        subtitle={`Top ${AURA_RANKING_SIZE} del ranking · ${SPAIN_TIMEZONE_LABEL}`}
        badges={
          <HeroBadge>
            <IconLabel icon="sparkles" iconSize={12}>
              {votesRemaining}/{AURA_VOTES_PER_WEEK} votos esta semana
            </IconLabel>
          </HeroBadge>
        }
      />

      <div className="mx-auto mb-4 max-w-[1100px] px-5 max-md:px-4">
        <p className="text-center text-sm leading-relaxed text-lm-text2">
          +230 aura o −100 aura por voto. Los votos se reinician cada lunes. Las
          puntuaciones de aura se reinician el día 1 de cada mes.
        </p>
        {voteError ? (
          <p
            className="mt-3 text-center text-sm font-semibold text-lm-red2"
            role="alert"
          >
            {voteError}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "mx-auto mb-6 grid max-w-[1100px] grid-cols-2 gap-3 px-5",
          "max-md:grid-cols-1 max-md:gap-2.5 max-md:px-4",
        )}
      >
        <ScrollReveal y={36}>
          <AuraLeadersCard
            title="Más Aura"
            titleIcon="trending-up"
            variant="up"
            leaders={ready ? top : []}
          />
        </ScrollReveal>
        <ScrollReveal y={36} delay={0.04}>
          <AuraLeadersCard
            title="Menos Aura"
            titleIcon="trending-down"
            variant="down"
            leaders={ready ? bottom : []}
          />
        </ScrollReveal>
      </div>

      <div className="mx-auto max-w-[1100px] px-5 pb-16 max-md:px-3 max-md:pb-20">
        <ScrollReveal y={28} className="mb-4">
          <SectionTitle>
            <IconLabel icon="sparkles" iconSize={20}>
              Top {AURA_RANKING_SIZE} — Votar aura
            </IconLabel>
          </SectionTitle>
        </ScrollReveal>

        {!ready ? (
          <div className="py-8 text-center text-lm-text2">Cargando aura…</div>
        ) : (
          <div className="flex flex-col gap-2">
            {auraEntries.map((entry, i) => (
              <ScrollReveal key={entry.name} y={32} delay={Math.min(i * 0.01, 0.3)}>
                <AuraVoteRow
                  entry={entry}
                  scores={scores}
                  disabled={noVotesLeft}
                  votingName={votingName}
                  onBoost={handleBoost}
                  onPenalty={handlePenalty}
                  onOpenProfile={(name, rank) => openProfile(name, rank, "aura")}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
