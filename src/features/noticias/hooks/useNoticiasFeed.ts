"use client";

import { useEffect, useMemo, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";
import { useTorneo } from "@/features/torneo/hooks/useTorneo";
import { buildNoticiaEvents } from "@/features/noticias/lib/build-noticia-events";
import type {
  NoticiaEvent,
  RankVoteHistoryRow,
} from "@/features/noticias/lib/noticia-event";
import type { TorneoState } from "@/types/looksmax";

function dedupeHistory(rows: RankVoteHistoryRow[]): RankVoteHistoryRow[] {
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

export function useNoticiasFeed() {
  const { fb, ready: firebaseReady } = useFirebase();
  const { upMovers, downMovers, ready: rankingReady } = useRankingData();
  const { state: torneoState, loading: torneoLoading } = useTorneo(true);
  const [rankVoteHistoryState, setRankVoteHistoryState] = useState<{
    rows: RankVoteHistoryRow[];
    synced: boolean;
  }>({ rows: [], synced: false });

  useEffect(() => {
    if (!fb) return;

    const { db, ref, onValue } = fb;
    const unsub = onValue(ref(db, "rankvoteHistory"), (snap) => {
      if (!snap.exists()) {
        setRankVoteHistoryState({ rows: [], synced: true });
        return;
      }
      const raw = snap.val() as Record<string, RankVoteHistoryRow>;
      const hist = dedupeHistory(
        Object.values(raw).filter((h) => h.ts && typeof h.ts === "number"),
      )
        .toSorted((a, b) => b.ts - a.ts)
        .slice(0, 20);
      setRankVoteHistoryState({ rows: hist, synced: true });
    });

    return () => unsub();
  }, [fb]);

  const { rows: rankVoteHistory, synced: historySynced } = rankVoteHistoryState;
  const historyReady = !fb || historySynced;
  const ready = firebaseReady && rankingReady && historyReady && !torneoLoading;

  const events = useMemo(
    () =>
      buildNoticiaEvents({
        upMovers,
        downMovers,
        rankVoteHistory,
        torneoState: torneoState as TorneoState | null,
      }),
    [upMovers, downMovers, rankVoteHistory, torneoState],
  );

  return {
    events,
    ready,
    isEmpty: ready && events.length === 0,
  };
}

export type { NoticiaEvent };
