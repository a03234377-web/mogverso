"use client";

import { useCallback, useState } from "react";
import { voteAuraApi } from "@/lib/api/vote-client";
import { formatVoteError, isBackendUnavailableReason } from "@/lib/api/vote-errors";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import type { AuraVoteKind } from "@/types/aura";

export function useAuraVote() {
  const { getToken } = useRecaptcha("aura_vote");
  const [votingName, setVotingName] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const castVote = useCallback(
    async (name: string, kind: AuraVoteKind) => {
      setVoteError(null);
      setVotingName(name);
      try {
        const token = await getToken();
        const res = await voteAuraApi(name, kind, token);
        if (!res.ok) {
          const reason = res.reason ?? res.error ?? "vote_failed";
          setVoteError(formatVoteError(reason));
          setBackendUnavailable(isBackendUnavailableReason(reason));
          return null;
        }
        setBackendUnavailable(false);
        return res;
      } catch (err) {
        console.error("[Aura] vote:", err);
        setVoteError(formatVoteError("vote_failed"));
        return null;
      } finally {
        setVotingName(null);
      }
    },
    [getToken],
  );

  return {
    votingName,
    voteError,
    backendUnavailable,
    castVote,
    clearError: () => setVoteError(null),
  };
}
