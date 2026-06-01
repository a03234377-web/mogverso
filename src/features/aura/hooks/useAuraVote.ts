"use client";

import { useCallback, useState } from "react";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { formatVoteError, isBackendUnavailableReason } from "@/lib/api/vote-errors";
import { voteAuraApi } from "@/lib/api/vote-client";
import { AURA_BOOST, AURA_PENALTY } from "@/lib/aura/constants";
import { coerceAuraScore } from "@/lib/aura/coerce-score";
import { getMadridWeekId } from "@/lib/aura/periods";
import type { AuraVoteKind } from "@/types/aura";

function deltaForKind(kind: AuraVoteKind): number {
  return kind === "boost" ? AURA_BOOST : -AURA_PENALTY;
}

export type AuraVoteSuccess = {
  name: string;
  aura: number;
  votesRemaining: number;
  delta: number;
  weekId: string;
  votedNames: string[];
};

export function useAuraVote(onSuccess?: (result: AuraVoteSuccess) => void) {
  const { getToken, enabled: recaptchaEnabled } = useRecaptcha("aura_vote");
  const [votingName, setVotingName] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const castVote = useCallback(
    async (name: string, kind: AuraVoteKind) => {
      setVoteError(null);
      setVoteSuccess(null);
      setVotingName(name);
      try {
        const token = await getToken();
        if (recaptchaEnabled && !token?.trim()) {
          setVoteError(formatVoteError("missing_recaptcha"));
          return null;
        }

        const res = await voteAuraApi(name, kind, token);
        if (!res.ok) {
          const reason = res.reason ?? res.error ?? "vote_failed";
          setVoteError(formatVoteError(reason));
          setBackendUnavailable(isBackendUnavailableReason(reason));
          return null;
        }

        setBackendUnavailable(false);
        const votesRemaining =
          typeof res.votesRemaining === "number" && Number.isFinite(res.votesRemaining)
            ? res.votesRemaining
            : undefined;
        const aura =
          res.aura !== undefined && res.aura !== null
            ? coerceAuraScore(res.aura)
            : undefined;
        const delta =
          res.delta !== undefined && res.delta !== null
            ? coerceAuraScore(res.delta)
            : deltaForKind(kind);

        if (votesRemaining === undefined || aura === undefined) {
          setVoteError(formatVoteError("vote_failed"));
          return null;
        }

        const weekId =
          typeof res.weekId === "string" && res.weekId.trim()
            ? res.weekId
            : getMadridWeekId();
        const canon = resolveCanonicalRankerName(name);
        const votedNames = Array.isArray(res.votedNames)
          ? res.votedNames.map((n) => resolveCanonicalRankerName(n))
          : [canon];

        onSuccess?.({ name, aura, votesRemaining, delta, weekId, votedNames });
        setVoteSuccess(name);
        window.setTimeout(() => {
          setVoteSuccess((current) => (current === name ? null : current));
        }, 2000);

        return res;
      } catch (err) {
        console.error("[Aura] vote:", err);
        setVoteError(formatVoteError("vote_failed"));
        return null;
      } finally {
        setVotingName(null);
      }
    },
    [getToken, onSuccess, recaptchaEnabled],
  );

  return {
    votingName,
    voteError,
    voteSuccess,
    backendUnavailable,
    castVote,
    clearError: () => setVoteError(null),
  };
}
