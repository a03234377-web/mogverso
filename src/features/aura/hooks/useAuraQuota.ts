"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { getDeviceId } from "@/lib/api/device-id";
import { AURA_VOTES_PER_WEEK } from "@/lib/aura/constants";
import { getMadridWeekId } from "@/lib/aura/periods";
import {
  mergeAuraWeekBallots,
  parseAuraWeekBallot,
  type AuraWeekBallot,
} from "@/lib/aura/week-ballot";

function ballotFromVotedNames(votedNames: string[], votesUsed: number): AuraWeekBallot {
  const byName: AuraWeekBallot["byName"] = {};
  for (const name of votedNames) {
    const canon = resolveCanonicalRankerName(name);
    byName[canon] = { kind: "boost", ts: 0, delta: 0 };
  }
  const used = Math.max(votesUsed, votedNames.length);
  return { used, byName };
}

/** Cada lunes (España) el cupo vuelve a {AURA_VOTES_PER_WEEK}; no se acumulan votos sin gastar. */
export function useAuraQuota() {
  const { fb, ready, error: firebaseError } = useFirebase();
  const [monthId, setMonthId] = useState("");
  const weekId = getMadridWeekId();
  const [ballot, setBallot] = useState<AuraWeekBallot>(() => parseAuraWeekBallot(null));
  const [ballotHydrated, setBallotHydrated] = useState(false);
  const [serverQuotaUnavailable, setServerQuotaUnavailable] = useState(false);
  const [usedOverride, setUsedOverride] = useState<{
    weekId: string;
    used: number;
    votedNames: string[];
  } | null>(null);
  const [, setWeekTick] = useState(0);
  const prevWeekRef = useRef(weekId);

  useEffect(() => {
    const id = window.setInterval(() => setWeekTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (prevWeekRef.current === weekId) return;
    prevWeekRef.current = weekId;
    setUsedOverride(null);
    setServerQuotaUnavailable(false);
    setBallot(parseAuraWeekBallot(null));
    setBallotHydrated(false);
  }, [weekId]);

  const applyServerBallot = useCallback((incoming: AuraWeekBallot) => {
    setBallot(incoming);
  }, []);

  const fetchQuotaFromApi = useCallback(async () => {
    const deviceId = getDeviceId();
    const res = await fetch(`/api/aura/quota?deviceId=${encodeURIComponent(deviceId)}`);
    const data = (await res.json()) as {
      ok?: boolean;
      weekId?: string;
      votesUsed?: number;
      votedNames?: string[];
      error?: string;
    };

    if (res.status === 503 || data.error === "server_not_configured") {
      setServerQuotaUnavailable(true);
      return false;
    }

    setServerQuotaUnavailable(false);

    if (!data.ok || !Array.isArray(data.votedNames)) return false;

    applyServerBallot(
      ballotFromVotedNames(
        data.votedNames,
        typeof data.votesUsed === "number" ? data.votesUsed : data.votedNames.length,
      ),
    );
    return true;
  }, [weekId, applyServerBallot]);

  const refreshQuota = useCallback(async () => {
    try {
      await fetchQuotaFromApi();
    } catch (err) {
      console.error("[Aura] quota refresh:", err);
    } finally {
      setBallotHydrated(true);
    }
  }, [fetchQuotaFromApi]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        if (!cancelled) await fetchQuotaFromApi();
      } catch (err) {
        console.error("[Aura] quota fetch:", err);
      } finally {
        if (!cancelled) setBallotHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [weekId, fetchQuotaFromApi]);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    const unsubMeta = onValue(ref(db, "aura/meta"), (snap) => {
      if (!snap.exists()) {
        setMonthId("");
        return;
      }
      const meta = snap.val() as { monthId?: string };
      setMonthId(meta.monthId ?? "");
    });

    return () => unsubMeta();
  }, [fb]);

  const votedNames = useMemo(() => {
    const names = new Set(Object.keys(ballot.byName));
    if (usedOverride?.weekId === weekId) {
      for (const n of usedOverride.votedNames) names.add(n);
    }
    return [...names];
  }, [ballot.byName, usedOverride, weekId]);

  const votesUsed =
    usedOverride?.weekId === weekId
      ? Math.max(ballot.used, usedOverride.used, votedNames.length)
      : Math.max(ballot.used, votedNames.length);

  const votesRemaining = Math.max(0, AURA_VOTES_PER_WEEK - votesUsed);

  const hasVotedFor = useCallback(
    (name: string) => {
      const canon = resolveCanonicalRankerName(name);
      return votedNames.includes(canon);
    },
    [votedNames],
  );

  const applyVoteResult = useCallback(
    (remaining: number, votedNamesFromServer: string[], responseWeekId?: string) => {
      const activeWeek = responseWeekId ?? weekId;
      const incoming = votedNamesFromServer.map((n) => resolveCanonicalRankerName(n));

      setBallot((prev) => {
        const merged = mergeAuraWeekBallots(
          prev,
          ballotFromVotedNames(incoming, incoming.length),
        );
        const allNames = Object.keys(merged.byName);
        const used = Math.max(
          0,
          AURA_VOTES_PER_WEEK - remaining,
          incoming.length,
          allNames.length,
        );
        const ballotWithUsed = { ...merged, used };

        setUsedOverride({
          weekId: activeWeek,
          used,
          votedNames: allNames,
        });
        return ballotWithUsed;
      });
    },
    [weekId],
  );

  /** @deprecated Usa `applyVoteResult` */
  const applyVotesRemaining = useCallback(
    (remaining: number, votedName?: string) => {
      const canon = votedName ? resolveCanonicalRankerName(votedName) : null;
      const nextNames = canon ? [...new Set([...votedNames, canon])] : [...votedNames];
      applyVoteResult(remaining, nextNames);
    },
    [votedNames, applyVoteResult],
  );

  return {
    ready: ready && ballotHydrated,
    /** Cupo cargado desde la API (Admin SDK / RTDB). */
    quotaReady: ballotHydrated,
    firebaseError,
    votesRemaining,
    votesUsed,
    votedNames,
    hasVotedFor,
    weekId,
    monthId: monthId || null,
    applyVotesRemaining,
    applyVoteResult,
    refreshQuota,
    serverQuotaUnavailable,
  };
}
