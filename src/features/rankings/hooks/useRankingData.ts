"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  buildRankedList,
  computeMovers,
  getRankedNamesFromOverrides,
} from "@/features/rankings/lib/ranking";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { healRankvoteApi } from "@/lib/api/vote-client";
import { parseAuraScores } from "@/lib/aura/coerce-score";
import { isRtdbPermissionDenied } from "@/lib/firebase/rtdb-errors";
import {
  AURA_RTDB_HYDRATE_TIMEOUT_MS,
  HEAL_RANKVOTE_COOLDOWN_MS,
} from "@/lib/vote-intervals";
import type { AuraScores } from "@/types/aura";
import type {
  MoverStack,
  RankMovements,
  RankOverrides,
  RankVoteRound,
} from "@/types/looksmax";

type RankingSyncState = {
  overrides: RankOverrides;
  overridesReady: boolean;
  movements: RankMovements;
  movementsUp: MoverStack;
  movementsDown: MoverStack;
  rankVoteEnd: number | null;
  auraScores: AuraScores;
  /** Optimistic aura tras votar hasta que RTDB confirma el mismo valor. */
  auraScorePatches: AuraScores;
};

const initialRankingSyncState: RankingSyncState = {
  overrides: {},
  overridesReady: false,
  movements: {},
  movementsUp: {},
  movementsDown: {},
  rankVoteEnd: null,
  auraScores: {},
  auraScorePatches: {},
};

type RankingSyncAction =
  | { type: "overrides"; payload: RankOverrides }
  | { type: "movements"; payload: RankMovements }
  | { type: "movementsUp"; payload: MoverStack }
  | { type: "movementsDown"; payload: MoverStack }
  | { type: "rankVoteActive"; payload: number }
  | { type: "rankVoteInactive" }
  | { type: "auraScores"; payload: AuraScores }
  | { type: "patchAuraScore"; name: string; aura: number };

function rankingSyncReducer(
  state: RankingSyncState,
  action: RankingSyncAction,
): RankingSyncState {
  switch (action.type) {
    case "overrides":
      return { ...state, overrides: action.payload, overridesReady: true };
    case "movements":
      return { ...state, movements: action.payload };
    case "movementsUp":
      return { ...state, movementsUp: action.payload };
    case "movementsDown":
      return { ...state, movementsDown: action.payload };
    case "rankVoteActive":
      return { ...state, rankVoteEnd: action.payload };
    case "rankVoteInactive":
      return { ...state, rankVoteEnd: null };
    case "auraScores": {
      const remote = action.payload;
      const merged: AuraScores = { ...remote };
      const nextPatches = { ...state.auraScorePatches };
      for (const [key, patchValue] of Object.entries(state.auraScorePatches)) {
        const remoteValue = remote[key];
        if (remoteValue === patchValue) {
          delete nextPatches[key];
        } else {
          merged[key] = patchValue;
        }
      }
      return { ...state, auraScores: merged, auraScorePatches: nextPatches };
    }
    case "patchAuraScore": {
      const canonical = resolveCanonicalRankerName(action.name);
      return {
        ...state,
        auraScores: { ...state.auraScores, [canonical]: action.aura },
        auraScorePatches: { ...state.auraScorePatches, [canonical]: action.aura },
      };
    }
    default:
      return state;
  }
}

export function useRankingData() {
  const { fb, ready } = useFirebase();
  const [syncState, dispatch] = useReducer(rankingSyncReducer, initialRankingSyncState);
  const healInFlightRef = useRef(false);
  const lastHealRef = useRef(0);
  const rtdbAuraActiveRef = useRef(false);
  const auraApiInFlightRef = useRef(false);

  const healRankVoteRound = useCallback(async (rv?: RankVoteRound) => {
    if (healInFlightRef.current) return;
    const now = Date.now();
    if (now - lastHealRef.current < HEAL_RANKVOTE_COOLDOWN_MS) return;
    lastHealRef.current = now;
    healInFlightRef.current = true;
    try {
      void rv;
      await healRankvoteApi();
    } catch (err) {
      console.error("[LooksMax] heal rankvote round:", err);
    } finally {
      healInFlightRef.current = false;
    }
  }, []);

  const fetchAuraScoresFromApi = useCallback(async () => {
    if (auraApiInFlightRef.current) return;
    auraApiInFlightRef.current = true;
    try {
      const res = await fetch("/api/aura/scores", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        scores?: Record<string, unknown>;
        error?: string;
      };
      if (res.status === 503 || data.error === "server_not_configured") return;
      if (!data.ok || !data.scores) return;
      const parsed = parseAuraScores(data.scores);
      if (Object.keys(parsed).length === 0) return;
      dispatch({ type: "auraScores", payload: parsed });
    } catch (err) {
      console.error("[LooksMax] aura scores API:", err);
    } finally {
      auraApiInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!ready || rtdbAuraActiveRef.current) return;

    const id = window.setTimeout(() => {
      if (!rtdbAuraActiveRef.current) void fetchAuraScoresFromApi();
    }, AURA_RTDB_HYDRATE_TIMEOUT_MS);

    return () => window.clearTimeout(id);
  }, [ready, fetchAuraScoresFromApi]);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    void healRankvoteApi().catch((err) => {
      console.error("[LooksMax] heal rankvote (rankings):", err);
    });

    const unsubO = onValue(ref(db, "rankOverrides"), (snap) => {
      dispatch({
        type: "overrides",
        payload: snap.exists() ? (snap.val() as RankOverrides) : {},
      });
    });
    const unsubM = onValue(ref(db, "rankMovements"), (snap) => {
      dispatch({
        type: "movements",
        payload: snap.exists() ? (snap.val() as RankMovements) : {},
      });
    });
    const unsubUp = onValue(ref(db, "rankMovementsUp"), (snap) => {
      dispatch({
        type: "movementsUp",
        payload: snap.exists() ? (snap.val() as MoverStack) : {},
      });
    });
    const unsubDown = onValue(ref(db, "rankMovementsDown"), (snap) => {
      dispatch({
        type: "movementsDown",
        payload: snap.exists() ? (snap.val() as MoverStack) : {},
      });
    });
    const unsubAura = onValue(
      ref(db, "aura/scores"),
      (snap) => {
        rtdbAuraActiveRef.current = true;
        const parsed = snap.exists() ? parseAuraScores(snap.val()) : {};
        dispatch({ type: "auraScores", payload: parsed });
      },
      (err) => {
        if (isRtdbPermissionDenied(err)) {
          void fetchAuraScoresFromApi();
          return;
        }
        console.error("[LooksMax] RTDB aura/scores:", err);
      },
    );
    const unsubRv = onValue(ref(db, "rankvote/current"), (snap) => {
      if (!snap.exists()) {
        dispatch({ type: "rankVoteInactive" });
        void healRankVoteRound();
        return;
      }

      const rv = snap.val() as RankVoteRound;
      const now = Date.now();

      if (!rv.resolved && rv.endTime > now) {
        dispatch({ type: "rankVoteActive", payload: rv.endTime });
        return;
      }

      dispatch({ type: "rankVoteInactive" });
      void healRankVoteRound(rv);
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void healRankVoteRound();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      unsubO();
      unsubM();
      unsubUp();
      unsubDown();
      unsubAura();
      unsubRv();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fb, healRankVoteRound, fetchAuraScoresFromApi]);

  const {
    overrides,
    overridesReady,
    movements,
    movementsUp,
    movementsDown,
    rankVoteEnd,
    auraScores,
  } = syncState;

  const rankedNames = useMemo(
    () =>
      fb
        ? fb.getRankedNamesFromOverrides(overrides)
        : getRankedNamesFromOverrides(overrides),
    [fb, overrides],
  );

  const entries = useMemo(
    () =>
      buildRankedList(overrides, movements, undefined, {
        up: movementsUp,
        down: movementsDown,
      }),
    [overrides, movements, movementsUp, movementsDown],
  );

  const { upMovers, downMovers } = useMemo(
    () =>
      computeMovers(rankedNames, movements, {
        up: movementsUp,
        down: movementsDown,
      }),
    [rankedNames, movements, movementsUp, movementsDown],
  );

  const rankingReady = ready && (!fb || overridesReady);

  const patchAuraScore = useCallback((name: string, aura: number) => {
    dispatch({ type: "patchAuraScore", name, aura });
  }, []);

  const refreshAuraScores = useCallback(async () => {
    await fetchAuraScoresFromApi();
  }, [fetchAuraScoresFromApi]);

  return {
    ready: rankingReady,
    entries: rankingReady ? entries : [],
    upMovers: rankingReady ? upMovers : [],
    downMovers: rankingReady ? downMovers : [],
    rankVoteEnd,
    auraScores,
    patchAuraScore,
    refreshAuraScores,
    overrides,
  };
}
