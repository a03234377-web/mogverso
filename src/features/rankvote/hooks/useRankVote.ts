"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import type {
  RankOverrides,
  RankVoteMyVote,
  RankVoteRound,
} from "@/features/shared/lib/types";

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

export function useRankVote(active: boolean) {
  const { fb } = useFirebase();
  const [rv, setRv] = useState<RankVoteRound | null>(null);
  const [myVote, setMyVote] = useState<RankVoteMyVote | null>(null);
  const [overrides, setOverrides] = useState<RankOverrides>({});
  const [history, setHistory] = useState<RvHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [voting, setVoting] = useState(false);
  const resolvingRef = useRef(false);
  const resolveInFlightRef = useRef<Promise<void> | null>(null);
  const rvIdRef = useRef<string | null>(null);

  const runResolve = useCallback(
    async (round: Record<string, unknown>) => {
      if (!fb) return;
      if (resolveInFlightRef.current) {
        await resolveInFlightRef.current.catch(() => {});
        return;
      }
      resolvingRef.current = true;
      const task = fb
        .resolveRVIfNeeded(round)
        .catch(console.error)
        .finally(() => {
          resolvingRef.current = false;
          resolveInFlightRef.current = null;
        });
      resolveInFlightRef.current = task;
      await task;
    },
    [fb],
  );

  const handleSnapshot = useCallback(
    async (round: RankVoteRound | null) => {
      if (!fb) return;
      const { db, ref, get, DEVICE_ID } = fb;
      const arenaActive = active;

      if (!round) {
        if (!resolvingRef.current) {
          resolvingRef.current = true;
          await fb.ensureRVExists().catch(console.error);
          resolvingRef.current = false;
        }
        return;
      }

      const now = Date.now();

      if (round.resolved === true) {
        if (arenaActive) setTransitioning(true);
        rvIdRef.current = null;
        if (!resolvingRef.current) {
          resolvingRef.current = true;
          await fb.ensureRVExists().catch(console.error);
          resolvingRef.current = false;
        }
        return;
      }

      if (round.endTime <= now) {
        if (arenaActive) setTransitioning(true);
        if (!resolvingRef.current) await runResolve(round as Record<string, unknown>);
        return;
      }

      setTransitioning(false);
      rvIdRef.current = round.id;
      setRv(round);

      const [ovSnap, myVoteSnap] = await Promise.all([
        get(ref(db, "rankOverrides")),
        get(ref(db, `rankvoteVotes/dev_${DEVICE_ID}_${round.id}`)),
      ]);
      setOverrides(ovSnap.exists() ? (ovSnap.val() as RankOverrides) : {});
      setMyVote(
        myVoteSnap.exists()
          ? { rvId: round.id, candidate: myVoteSnap.val().candidate as string }
          : null,
      );
      setLoading(false);
    },
    [fb, active, runResolve],
  );

  useEffect(() => {
    if (!fb || !active) return;
    rvIdRef.current = null;

    let unsubRv: (() => void) | undefined;
    let unsubHist: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      await fb.ensureRVExists();
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
  }, [fb, active, handleSnapshot]);

  const vote = useCallback(
    async (name: string) => {
      if (!fb || !rv || voting) return;
      setVoting(true);
      try {
        const result = await fb.castRVVoteDB(name);
        if (result.ok) {
          const snap = await fb.get(fb.ref(fb.db, "rankvote/current"));
          const fresh = snap.exists() ? (snap.val() as RankVoteRound) : rv;
          setRv(fresh);
          setMyVote({ rvId: fresh.id, candidate: name });
        }
        return result;
      } finally {
        setVoting(false);
      }
    },
    [fb, rv, voting],
  );

  useEffect(() => {
    if (!rv || !active || rv.resolved) return;
    if (rv.endTime <= Date.now()) return;

    const id = setInterval(() => {
      if (rv.endTime <= Date.now() && !resolvingRef.current) {
        setTransitioning(true);
        void runResolve(rv as Record<string, unknown>);
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
    voting,
    vote,
  };
}
