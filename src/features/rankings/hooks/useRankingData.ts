"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  buildRankedList,
  computeMovers,
  getRankedNamesFromOverrides,
} from "@/features/rankings/lib/ranking";
import type {
  MoverStack,
  RankMovements,
  RankOverrides,
  RankVoteRound,
} from "@/features/shared/lib/types";

type RankingSyncState = {
  overrides: RankOverrides;
  overridesReady: boolean;
  movements: RankMovements;
  movementsUp: MoverStack;
  movementsDown: MoverStack;
  rankVoteEnd: number | null;
};

const initialRankingSyncState: RankingSyncState = {
  overrides: {},
  overridesReady: false,
  movements: {},
  movementsUp: {},
  movementsDown: {},
  rankVoteEnd: null,
};

type RankingSyncAction =
  | { type: "overrides"; payload: RankOverrides }
  | { type: "movements"; payload: RankMovements }
  | { type: "movementsUp"; payload: MoverStack }
  | { type: "movementsDown"; payload: MoverStack }
  | { type: "rankVoteActive"; payload: number }
  | { type: "rankVoteInactive" };

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
    default:
      return state;
  }
}

export function useRankingData() {
  const { fb, ready } = useFirebase();
  const [syncState, dispatch] = useReducer(rankingSyncReducer, initialRankingSyncState);
  const healInFlightRef = useRef(false);

  const healRankVoteRound = useCallback(
    async (rv?: RankVoteRound) => {
      if (!fb || healInFlightRef.current) return;
      healInFlightRef.current = true;
      try {
        const now = Date.now();
        if (rv && !rv.resolved && rv.endTime <= now) {
          await fb.resolveRVIfNeeded(rv as Record<string, unknown>);
        } else {
          await fb.ensureRVExists();
        }
      } catch (err) {
        console.error("[LooksMax] heal rankvote round:", err);
      } finally {
        healInFlightRef.current = false;
      }
    },
    [fb],
  );

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    void fb.ensureRVExists().catch((err) => {
      console.error("[LooksMax] ensureRVExists (rankings):", err);
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

    const healPoll = setInterval(() => {
      void healRankVoteRound();
    }, 4000);

    return () => {
      unsubO();
      unsubM();
      unsubUp();
      unsubDown();
      unsubRv();
      clearInterval(healPoll);
    };
  }, [fb, healRankVoteRound]);

  const {
    overrides,
    overridesReady,
    movements,
    movementsUp,
    movementsDown,
    rankVoteEnd,
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

  return {
    ready: rankingReady,
    entries: rankingReady ? entries : [],
    upMovers: rankingReady ? upMovers : [],
    downMovers: rankingReady ? downMovers : [],
    rankVoteEnd,
    overrides,
  };
}
