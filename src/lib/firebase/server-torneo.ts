import {
  buildOctavosTorneoState,
  createWaitingTorneoState,
  PHASES,
} from "@/features/torneo/data/torneo-players";
import {
  getEditionStartMsForWeekContaining,
  getTorneoVotingCanonicalEndMs,
  getUpcomingTorneoStartMs,
  isTorneoLegacyBreakReadyToOpen,
  isTorneoPhaseExpired,
  isTorneoVotingPhaseExpired,
  shouldForceTorneoWaitingBeforeStart,
  TORNEO_PHASE_DURATION_MS,
} from "@/lib/torneo-schedule";
import { buildFinalMatch } from "@/lib/torneo-bracket";
import {
  buildCuartosToSemisState,
  buildOctavosToCuartosState,
  buildSemisToFinalState,
  resolveLegacyBreakAdvanceState,
  repairActiveRoundMatches,
  withCanonicalVotingPhaseEnd,
} from "@/lib/torneo-phase-transition";
import { applyTorneoChampionPrize } from "@/lib/firebase/server-torneo-prize";
import { fetchTorneoSeedNames } from "@/lib/firebase/torneo-seed";
import { TORNEO_CHAMPION_PRIZE_DURATION_MS } from "@/lib/torneo-champion-prize";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";
import { getAdminDatabase } from "./admin";

let torneoAdvancing = false;

async function getTorneoState(): Promise<TorneoState | null> {
  const db = getAdminDatabase();
  const snap = await db.ref("torneo/state").get();
  return snap.exists() ? (snap.val() as TorneoState) : null;
}

/** Full reset: new waiting/edition — clears vote dedup records. */
async function resetTorneoState(state: Record<string, unknown>) {
  const db = getAdminDatabase();
  await db.ref("torneoVotes").set(null);
  await db.ref("torneo/state").set(state);
}

async function atomicAdvanceTorneoPhase(
  expectedPhase: string,
  newState: Record<string, unknown>,
): Promise<boolean> {
  const db = getAdminDatabase();
  const phaseRef = db.ref("torneo/state/phase");
  let advanced = false;
  try {
    const result = await phaseRef.transaction((cur) => {
      if (cur !== expectedPhase) return;
      advanced = true;
      return newState.phase;
    });
    if (!result.committed) advanced = false;
  } catch {
    return false;
  }
  if (!advanced) return false;
  await db.ref("torneo/state").update(newState);
  return true;
}

function preserveEditionMeta(state: TorneoState, patch: TorneoState): TorneoState {
  return {
    ...state,
    ...patch,
    editionStartMs: patch.editionStartMs ?? state.editionStartMs,
    seedNames: patch.seedNames ?? state.seedNames,
    createdAt: patch.createdAt ?? state.createdAt,
  };
}

async function applyTorneoStatePatch(patch: Partial<TorneoState>): Promise<boolean> {
  if (Object.keys(patch).length === 0) return false;
  const db = getAdminDatabase();
  await db.ref("torneo/state").update(patch);
  return true;
}

/**
 * Tras la hora de inicio, pasar de `waiting_octavos` a octavos (RTDB).
 * Transición atómica: no borra votos ni reinicia si otro request ya avanzó la fase.
 */
export async function ensureTorneoOctavosStarted(
  now = Date.now(),
): Promise<TorneoState | null> {
  const existing = await getTorneoState();
  if (!existing) return null;
  if (existing.phase !== PHASES.WAITING_OCTAVOS) return existing;

  const editionStart = getEditionStartMsForWeekContaining(now);
  if (now < editionStart) return existing;

  const db = getAdminDatabase();
  const phaseRef = db.ref("torneo/state/phase");
  let shouldWrite = false;

  const tx = await phaseRef.transaction((cur) => {
    if (cur !== PHASES.WAITING_OCTAVOS) return cur;
    shouldWrite = true;
    return PHASES.OCTAVOS_VOTING;
  });

  if (!shouldWrite || !tx.committed) {
    return getTorneoState();
  }

  const seedNames = await fetchTorneoSeedNames();
  const fresh = buildOctavosTorneoState(now, seedNames, editionStart);

  await db.ref("torneo/state").update({
    phase: fresh.phase,
    phaseStart: fresh.phaseStart,
    phaseEnd: fresh.phaseEnd,
    editionStartMs: fresh.editionStartMs,
    seedNames: fresh.seedNames,
    matches: fresh.matches,
    createdAt: fresh.createdAt,
    octavosWinners: null,
    cuartosWinners: null,
  });

  return getTorneoState();
}

async function doAdvanceTorneoPhase(
  state: TorneoState,
  now: number,
): Promise<TorneoState> {
  if (state.phase === PHASES.WAITING_OCTAVOS) {
    return (await ensureTorneoOctavosStarted(now)) ?? state;
  }

  if (state.phase === PHASES.OCTAVOS_VOTING) {
    const newState = buildOctavosToCuartosState(state, now);
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.OCTAVOS_VOTING,
      preserveEditionMeta(state, newState) as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return preserveEditionMeta(state, newState);
  }

  if (state.phase === PHASES.CUARTOS_VOTING) {
    const newState = buildCuartosToSemisState(state, now);
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.CUARTOS_VOTING,
      preserveEditionMeta(state, newState) as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return preserveEditionMeta(state, newState);
  }

  if (state.phase === PHASES.SEMIFINALS_VOTING) {
    const newState = buildSemisToFinalState(state, now);
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.SEMIFINALS_VOTING,
      preserveEditionMeta(state, newState) as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return preserveEditionMeta(state, newState);
  }

  if (state.phase === PHASES.BREAK_FINAL) {
    const semisWinners = state.semisWinners || [];
    const finalMatch = buildFinalMatch(semisWinners);
    const newState = withCanonicalVotingPhaseEnd(
      {
        ...state,
        phase: PHASES.FINAL_VOTING,
        phaseStart: now,
        phaseEnd: now + TORNEO_PHASE_DURATION_MS,
        finalMatch,
      },
      now,
    );
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.BREAK_FINAL,
      preserveEditionMeta(state, newState) as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return preserveEditionMeta(state, newState);
  }

  if (state.phase === PHASES.FINAL_VOTING) {
    const fm = state.finalMatch || ({} as TorneoMatch);
    const v1 = fm.votes?.[fm.p1] || 0;
    const v2 = fm.votes?.[fm.p2] || 0;
    const champion = v1 >= v2 ? fm.p1 : fm.p2;
    const updatedFinal: TorneoMatch = { ...fm, winner: champion, resolved: true };
    const prizeEndMs = now + TORNEO_CHAMPION_PRIZE_DURATION_MS;
    const newState: TorneoState = {
      phase: PHASES.TORNEO_ENDED,
      phaseStart: now,
      phaseEnd: prizeEndMs,
      prizeEndMs,
      prizeApplied: false,
      champion,
      finalMatch: updatedFinal,
    };
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.FINAL_VOTING,
      preserveEditionMeta(state, newState) as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return preserveEditionMeta(state, newState);
  }

  return state;
}

async function advanceTorneoPhaseIfNeeded(
  state: TorneoState | null,
  now = Date.now(),
): Promise<TorneoState | null> {
  if (!state) return state;

  if (!isTorneoPhaseExpired(state, now)) return state;

  if (torneoAdvancing) {
    await new Promise((r) => setTimeout(r, 500));
    return getTorneoState();
  }

  torneoAdvancing = true;
  try {
    return await doAdvanceTorneoPhase(state, now);
  } catch (e) {
    console.error("[server-torneo] advance error:", e);
    return state;
  } finally {
    setTimeout(() => {
      torneoAdvancing = false;
    }, 2000);
  }
}

export async function healTorneo(options?: {
  restartIfEnded?: boolean;
}): Promise<{ healed: boolean }> {
  const now = Date.now();
  const existing = await getTorneoState();

  if (!existing) {
    const waiting = createWaitingTorneoState(now);
    await resetTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  const editionStart = getUpcomingTorneoStartMs(now);

  if (shouldForceTorneoWaitingBeforeStart(now, existing.phase)) {
    const waiting = createWaitingTorneoState(now);
    await resetTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (
    now < editionStart &&
    (existing.phase !== PHASES.WAITING_OCTAVOS ||
      Math.abs(existing.phaseEnd - editionStart) > 60_000)
  ) {
    const waiting = createWaitingTorneoState(now);
    await resetTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (existing.phase === PHASES.TORNEO_ENDED && !existing.prizeApplied) {
    const prizeEnd =
      existing.prizeEndMs ??
      (existing.phaseStart ?? now) + TORNEO_CHAMPION_PRIZE_DURATION_MS;
    if (now >= prizeEnd - 2_000) {
      if (existing.champion) {
        await applyTorneoChampionPrize(existing.champion);
      }
      await applyTorneoStatePatch({
        prizeApplied: true,
        prizeEndMs: prizeEnd,
        phaseEnd: getUpcomingTorneoStartMs(now + 60_000),
      });
      return { healed: true };
    }
    if (!existing.prizeEndMs || Math.abs(existing.phaseEnd - prizeEnd) > 60_000) {
      await applyTorneoStatePatch({ prizeEndMs: prizeEnd, phaseEnd: prizeEnd });
      return { healed: true };
    }
  }

  if (options?.restartIfEnded && existing.phase === PHASES.TORNEO_ENDED) {
    const waiting = createWaitingTorneoState(now);
    await resetTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (
    existing.phase === PHASES.BREAK_FINAL &&
    (!existing.semisMatches || Object.keys(existing.semisMatches).length === 0)
  ) {
    const waiting = createWaitingTorneoState(now);
    await resetTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (
    existing.phase === PHASES.BREAK_CUARTOS ||
    existing.phase === PHASES.SEMIFINALS_PROMO
  ) {
    const readyToOpen =
      isTorneoLegacyBreakReadyToOpen(existing, now) ||
      isTorneoPhaseExpired(existing, now);
    if (!readyToOpen) {
      return { healed: false };
    }
    const advanced = resolveLegacyBreakAdvanceState(existing, now);
    if (!advanced) return { healed: false };
    const ok = await atomicAdvanceTorneoPhase(
      existing.phase,
      preserveEditionMeta(existing, advanced) as Record<string, unknown>,
    );
    return { healed: ok };
  }

  if (existing.phase === PHASES.WAITING_OCTAVOS) {
    const editionStart = getEditionStartMsForWeekContaining(now);
    if (now < editionStart) {
      if (Math.abs(existing.phaseEnd - editionStart) > 60_000) {
        const waiting = createWaitingTorneoState(now);
        await resetTorneoState(waiting as Record<string, unknown>);
        return { healed: true };
      }
      return { healed: false };
    }

    await ensureTorneoOctavosStarted(now);
    return { healed: true };
  }

  const roundPatch = repairActiveRoundMatches(existing, now);
  if (roundPatch && (await applyTorneoStatePatch(roundPatch))) {
    return { healed: true };
  }

  const votingTimedOut =
    getTorneoVotingCanonicalEndMs(existing, now) != null &&
    isTorneoVotingPhaseExpired(existing, now);

  if (votingTimedOut) {
    await advanceTorneoPhaseIfNeeded(existing, now);
    return { healed: true };
  }

  const synced = withCanonicalVotingPhaseEnd(existing, now);
  if (synced.phaseEnd !== existing.phaseEnd) {
    await applyTorneoStatePatch({ phaseEnd: synced.phaseEnd });
    return { healed: true };
  }

  const votingEnd = getTorneoVotingCanonicalEndMs(existing, now);
  if (votingEnd != null && Math.abs(existing.phaseEnd - votingEnd) > 60_000) {
    const db = getAdminDatabase();
    await db.ref("torneo/state/phaseEnd").set(votingEnd);
    return { healed: true };
  }

  await advanceTorneoPhaseIfNeeded(existing, now);
  return { healed: true };
}
