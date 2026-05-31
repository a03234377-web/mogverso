"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  isKnownRankerName,
  isValidRankVotePair,
} from "@/features/rankings/lib/ranker-name";
import {
  readStoredRankVote,
  writeStoredRankVote,
} from "@/lib/api/rankvote-vote-storage";
import { healRankvoteApi, voteRankvoteApi } from "@/lib/api/vote-client";
import {
  formatHealError,
  formatVoteError,
  isBackendUnavailableReason,
} from "@/lib/api/vote-errors";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import type { RankOverrides, RankVoteMyVote, RankVoteRound } from "@/types/looksmax";

type RvHistoryRow = {
  id?: string;
  winner: string;
  loser: string;
  wVotes: number;
  lVotes: number;
  ts: number;
  winnerPos?: number;
  loserPos?: number;
  winnerNewPos?: number;
  loserNewPos?: number;
};

function dedupeHistory(rows: RvHistoryRow[]): RvHistoryRow[] {
  return rows.filter((h, i, arr) => {
    const idx = arr.findIndex((x) => {
      if (h.id && x.id) return x.id === h.id;
      return (
        x.winner === h.winner &&
        x.loser === h.loser &&
        x.wVotes === h.wVotes &&
        x.lVotes === h.lVotes &&
        x.winnerNewPos === h.winnerNewPos &&
        x.loserNewPos === h.loserNewPos &&
        Math.abs(x.ts - h.ts) < 60_000
      );
    });
    return idx === i;
  });
}

function resolveMyVote(
  roundId: string,
  candidate: unknown,
  previous: RankVoteMyVote | null,
): RankVoteMyVote | null {
  if (typeof candidate === "string" && isKnownRankerName(candidate)) {
    return { rvId: roundId, candidate };
  }

  const stored = readStoredRankVote(roundId);
  if (stored && isKnownRankerName(stored)) {
    return { rvId: roundId, candidate: stored };
  }

  if (previous?.rvId === roundId && previous.candidate) {
    return previous;
  }

  return null;
}

export function useRankVote(active: boolean) {
  const { fb } = useFirebase();
  const { getToken } = useRecaptcha("rankvote");
  const [rv, setRv] = useState<RankVoteRound | null>(null);
  const [myVote, setMyVote] = useState<RankVoteMyVote | null>(null);
  const [overrides, setOverrides] = useState<RankOverrides>({});
  const [history, setHistory] = useState<RvHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [healError, setHealError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [voting, setVoting] = useState(false);
  const resolveInFlightRef = useRef<Promise<void> | null>(null);
  const lastHealRef = useRef(0);

  const requestNewRound = useCallback(async () => {
    const now = Date.now();
    if (now - lastHealRef.current < 2000) return;
    lastHealRef.current = now;
    try {
      const res = await healRankvoteApi();
      if (!res.ok) {
        const reason = res.reason ?? res.error ?? "heal_failed";
        setHealError(formatVoteError(reason));
        setBackendUnavailable(isBackendUnavailableReason(reason));
        return;
      }
      setHealError(null);
      setBackendUnavailable(false);
    } catch (err) {
      console.error("[LooksMax] healRankvoteApi:", err);
      setHealError(formatHealError(err));
    }
  }, []);

  const runResolve = useCallback(async () => {
    if (resolveInFlightRef.current) {
      await resolveInFlightRef.current.catch(() => {});
      return;
    }
    const task = requestNewRound()
      .catch((err) => {
        console.error("[LooksMax] heal rankvote:", err);
        setHealError(formatHealError(err));
      })
      .finally(() => {
        resolveInFlightRef.current = null;
      });
    resolveInFlightRef.current = task;
    await task;
  }, [requestNewRound]);

  const handleSnapshot = useCallback(
    async (round: RankVoteRound | null) => {
      if (!fb) return;
      const { db, ref, get, DEVICE_ID } = fb;
      const arenaActive = active;

      if (!round) {
        if (arenaActive) setTransitioning(true);
        await requestNewRound();
        return;
      }

      const now = Date.now();

      if (round.resolved === true) {
        if (arenaActive) setTransitioning(true);
        setRv(null);
        await requestNewRound();
        return;
      }

      if (round.endTime <= now) {
        if (arenaActive) setTransitioning(true);
        await runResolve();
        return;
      }

      if (!isValidRankVotePair(round)) {
        if (arenaActive) setTransitioning(true);
        await requestNewRound();
        return;
      }

      setTransitioning(false);
      if (!backendUnavailable) {
        setHealError(null);
      }
      setRv(round);

      let overridesNext: RankOverrides = {};
      try {
        const ovSnap = await get(ref(db, "rankOverrides"));
        overridesNext = ovSnap.exists() ? (ovSnap.val() as RankOverrides) : {};
      } catch (err) {
        console.error("[LooksMax] rankOverrides read:", err);
      }
      setOverrides(overridesNext);

      let remoteCandidate: unknown;
      try {
        const myVoteSnap = await get(
          ref(db, `rankvoteVotes/dev_${DEVICE_ID}_${round.id}`),
        );
        remoteCandidate = myVoteSnap.exists()
          ? (myVoteSnap.val() as { candidate?: unknown }).candidate
          : undefined;
      } catch (err) {
        console.error("[LooksMax] rankvoteVotes read:", err);
        remoteCandidate = undefined;
      }

      setMyVote((previous) => resolveMyVote(round.id, remoteCandidate, previous));
      setLoading(false);
    },
    [fb, active, backendUnavailable, runResolve, requestNewRound],
  );

  useEffect(() => {
    if (!fb || !active) return;

    let unsubRv: (() => void) | undefined;
    let unsubHist: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      await requestNewRound();
      if (cancelled) return;
      const { db, ref, onValue } = fb;
      unsubRv = onValue(ref(db, "rankvote/current"), (snap) => {
        void handleSnapshot(snap.exists() ? (snap.val() as RankVoteRound) : null);
      });
      unsubHist = onValue(ref(db, "rankvoteHistory"), (snap) => {
        if (!snap.exists()) {
          setHistory([]);
          return;
        }
        const raw = snap.val() as Record<string, RvHistoryRow>;
        const hist = dedupeHistory(
          Object.values(raw).filter((h) => h.ts && typeof h.ts === "number"),
        )
          .sort((a, b) => b.ts - a.ts)
          .slice(0, 20);
        setHistory(hist);
      });
    })();

    return () => {
      cancelled = true;
      unsubRv?.();
      unsubHist?.();
    };
  }, [fb, active, handleSnapshot, requestNewRound]);

  useEffect(() => {
    if (!fb || !active || !transitioning) return;
    const id = setInterval(() => {
      void requestNewRound();
    }, 3000);
    return () => clearInterval(id);
  }, [fb, active, transitioning, requestNewRound]);

  const vote = useCallback(
    async (name: string) => {
      if (!fb || !rv || voting) {
        return { ok: false as const, reason: "vote_failed" as const };
      }
      if (!isKnownRankerName(name)) {
        const reason = "invalid_candidate";
        setVoteError(formatVoteError(reason));
        return { ok: false as const, reason };
      }

      setVoteError(null);
      setVoting(true);
      try {
        const token = await getToken();
        const result = await voteRankvoteApi(name, token);
        if (result.ok) {
          const snap = await fb.get(fb.ref(fb.db, "rankvote/current"));
          const fresh = snap.exists() ? (snap.val() as RankVoteRound) : rv;
          setRv(fresh);
          setMyVote({ rvId: fresh.id, candidate: name });
          writeStoredRankVote(fresh.id, name);
          setBackendUnavailable(false);
          return { ok: true as const, rv: fresh };
        }

        const reason = result.reason ?? result.error ?? "vote_failed";
        setVoteError(formatVoteError(reason));
        if (isBackendUnavailableReason(reason)) {
          setBackendUnavailable(true);
          setHealError(formatVoteError(reason));
        }
        return { ok: false as const, reason };
      } finally {
        setVoting(false);
      }
    },
    [fb, rv, voting, getToken],
  );

  useEffect(() => {
    if (!rv || !active || rv.resolved) return;
    if (rv.endTime <= Date.now()) return;

    const id = setInterval(() => {
      if (rv.endTime <= Date.now()) {
        setTransitioning(true);
        void runResolve();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [rv, active, runResolve]);

  return {
    rv,
    myVote,
    overrides,
    history,
    loading,
    transitioning,
    healError,
    voteError,
    backendUnavailable,
    voting,
    vote,
    retryHeal: requestNewRound,
    clearVoteError: () => setVoteError(null),
  };
}
