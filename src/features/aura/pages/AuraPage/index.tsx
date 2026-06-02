"use client";

import { useCallback, useMemo, useState } from "react";
import { IconLabel } from "@/components/icons";
import { HeroBadge, HeroSection } from "@/components/ui/HeroSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { AuraHowItWorksModal } from "@/features/aura/components/AuraHowItWorksModal";
import { AuraLeadersCard } from "@/features/aura/components/AuraLeadersCard";
import { AuraLeadersGrid } from "@/features/aura/components/AuraLeadersGrid";
import { AuraQuotaNotice } from "@/features/aura/components/AuraQuotaNotice";
import { AuraVoteList } from "@/features/aura/components/AuraVoteList";
import { useAuraHowItWorksModal } from "@/features/aura/hooks/useAuraHowItWorksModal";
import { useAuraQuota } from "@/features/aura/hooks/useAuraQuota";
import { useAuraVote } from "@/features/aura/hooks/useAuraVote";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { useLooksMaxNavigate } from "@/features/app/shell/LooksMaxShell";
import { useProfileReturnRestore } from "@/features/app/hooks/useProfileReturnRestore";
import { useProfileTargetFocus } from "@/features/app/hooks/useProfileTargetFocus";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { AURA_RANKING_SIZE, AURA_VOTES_PER_WEEK } from "@/lib/aura/constants";
import { computeAuraLeaders, sortEntriesByAura } from "@/lib/aura/leaderboard";
import { SPAIN_TIMEZONE_LABEL } from "@/lib/spain-time";
import type { RankedEntry } from "@/features/rankings/lib/ranking";
import type { AuraScores } from "@/types/aura";
import { cn } from "@/lib/cn";

type AuraPageProps = {
  entries: RankedEntry[];
  rankingReady: boolean;
  scoresReady: boolean;
  scores: AuraScores;
  onPatchScore: (name: string, aura: number) => void;
};

export function AuraPage({
  entries,
  rankingReady,
  scoresReady,
  scores,
  onPatchScore,
}: AuraPageProps) {
  const { fb, error: firebaseInitError } = useFirebase();
  const { open: howItWorksOpen, close: closeHowItWorks } = useAuraHowItWorksModal();
  const { openProfile } = useLooksMaxNavigate();
  const listReady = rankingReady;
  const voteFocusTarget = useProfileTargetFocus(listReady);

  useProfileReturnRestore("aura", listReady && entries.length > 0);

  const {
    votesRemaining,
    votesUsed,
    votedNames,
    hasVotedFor,
    quotaReady,
    firebaseError,
    applyVoteResult,
    refreshQuota,
    serverQuotaUnavailable,
  } = useAuraQuota();

  const [lastVoteDelta, setLastVoteDelta] = useState<{
    name: string;
    delta: number;
  } | null>(null);

  const onVoteSuccess = useCallback(
    (result: {
      name: string;
      aura: number;
      votesRemaining: number;
      delta: number;
      weekId: string;
      votedNames: string[];
    }) => {
      const canon = resolveCanonicalRankerName(result.name);
      onPatchScore(canon, result.aura);
      applyVoteResult(result.votesRemaining, result.votedNames, result.weekId);
      void refreshQuota();
      setLastVoteDelta({ name: canon, delta: result.delta });
      window.setTimeout(() => {
        setLastVoteDelta((current) => (current?.name === result.name ? null : current));
      }, 2500);
    },
    [onPatchScore, applyVoteResult, refreshQuota],
  );

  const {
    votingName,
    voteError,
    voteSuccess,
    backendUnavailable,
    castVote,
    clearError,
  } = useAuraVote(onVoteSuccess);

  const auraPool = useMemo(() => entries.slice(0, AURA_RANKING_SIZE), [entries]);

  const auraEntries = useMemo(
    () => sortEntriesByAura(auraPool, scores),
    [auraPool, scores],
  );

  const rankedNames = useMemo(() => auraPool.map((e) => e.name), [auraPool]);

  const { top, bottom } = useMemo(
    () => computeAuraLeaders(rankedNames, scores),
    [rankedNames, scores],
  );

  const pageReady = rankingReady && quotaReady;
  const leadersReady = rankingReady && scoresReady;
  const votesBackendReady = !serverQuotaUnavailable && !backendUnavailable;
  const canVote = Boolean(fb) && pageReady && votesBackendReady;
  const noVotesLeft = quotaReady && votesRemaining <= 0;

  const isRowDisabled = (name: string) => {
    if (hasVotedFor(name)) return true;
    if (!canVote) return true;
    if (noVotesLeft) return true;
    return false;
  };

  const handleBoost = async (name: string) => {
    clearError();
    await castVote(name, "boost");
  };

  const handlePenalty = async (name: string) => {
    clearError();
    await castVote(name, "penalty");
  };

  const connectionError = firebaseInitError ?? firebaseError;

  const heroQuotaBadge = useMemo(
    () => (
      <HeroBadge>
        <IconLabel icon="sparkles" iconSize={12}>
          {pageReady
            ? `${votesRemaining}/${AURA_VOTES_PER_WEEK} votos esta semana`
            : "Cargando cupo…"}
        </IconLabel>
      </HeroBadge>
    ),
    [pageReady, votesRemaining],
  );

  return (
    <div id="page-aura" className="block animate-fade-up">
      <AuraHowItWorksModal open={howItWorksOpen} onClose={closeHowItWorks} />
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
        badges={heroQuotaBadge}
      />

      <div className="mx-auto mb-4 max-w-[1100px] px-5 max-md:px-4">
        <p className="text-center text-sm leading-relaxed text-lm-text2">
          {AURA_VOTES_PER_WEEK} votos cada lunes (hora España), siempre desde cero; no
          se acumulan los de la semana anterior. Un voto por candidato (+230 / −100 al
          total del mes; puntos de aura se reinician el día 1).
        </p>
        {pageReady ? (
          <AuraQuotaNotice
            votesRemaining={votesRemaining}
            votesUsed={votesUsed}
            votedNames={votedNames}
          />
        ) : null}
        {connectionError ? (
          <p
            className="mt-3 text-center text-sm font-semibold text-lm-red2"
            role="alert"
          >
            Firebase: {connectionError}
          </p>
        ) : null}
        {!fb && pageReady ? (
          <p
            className="mt-3 text-center text-sm font-semibold text-lm-red2"
            role="alert"
          >
            Firebase no está configurado. Los votos de aura no están disponibles.
          </p>
        ) : null}
        {backendUnavailable || serverQuotaUnavailable ? (
          <p
            className="mt-3 text-center text-sm font-semibold text-lm-red2"
            role="alert"
          >
            Los votos de aura no se guardan en el servidor: falta{" "}
            <code className="text-xs">FIREBASE_SERVICE_ACCOUNT_JSON</code> en{" "}
            <code className="text-xs">.env.local</code>. Reinicia{" "}
            <code className="text-xs">pnpm run dev</code> tras añadirla.
          </p>
        ) : null}
        {voteError ? (
          <p
            className="mt-3 text-center text-sm font-semibold text-lm-red2"
            role="alert"
          >
            {voteError}
          </p>
        ) : null}
      </div>

      <AuraLeadersGrid
        ready={leadersReady}
        className={cn(
          "mx-auto mb-6 grid max-w-[1100px] grid-cols-2 gap-3 px-5",
          "max-md:grid-cols-1 max-md:gap-2.5 max-md:px-4",
        )}
      >
        <AuraLeadersCard
          title="Más Aura"
          titleIcon="trending-up"
          variant="up"
          ready={leadersReady}
          leaders={leadersReady ? top : []}
        />
        <AuraLeadersCard
          title="Menos Aura"
          titleIcon="trending-down"
          variant="down"
          ready={leadersReady}
          leaders={leadersReady ? bottom : []}
        />
      </AuraLeadersGrid>

      <div
        id="aura-vote-list"
        className="mx-auto max-w-[1100px] scroll-mt-24 px-5 pb-16 max-md:px-3 max-md:pb-20"
      >
        <div className="mb-4">
          <SectionTitle>
            <IconLabel icon="sparkles" iconSize={20}>
              Top {AURA_RANKING_SIZE}: votar aura
            </IconLabel>
          </SectionTitle>
        </div>

        <AuraVoteList
          entries={auraEntries}
          scores={scores}
          listReady={listReady}
          focusTarget={voteFocusTarget}
          disabledFor={(name) => isRowDisabled(name)}
          hasVotedFor={hasVotedFor}
          votingName={votingName}
          voteSuccessName={voteSuccess}
          lastVoteDelta={lastVoteDelta}
          onBoost={handleBoost}
          onPenalty={handlePenalty}
          onOpenProfile={(name, rank) => openProfile(name, rank, "aura")}
        />
      </div>
    </div>
  );
}
