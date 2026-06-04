import {
  buildOctavosTorneoState,
  createWaitingTorneoState,
  PHASES,
} from "@/features/torneo/data/torneo-players";
import {
  getEditionStartMsForWeekContaining,
  getTorneoVotingCanonicalEndMs,
  getUpcomingTorneoStartMs,
  shouldForceTorneoWaitingBeforeStart,
  TORNEO_PHASE_DURATION_MS,
} from "@/lib/torneo-schedule";
import {
  buildCuartosFromOctavosWinners,
  buildFinalMatch,
  buildSemisMatches,
  CUARTOS_IDS,
  OCTAVOS_IDS,
  resolveRoundMatches,
  SEMIS_IDS,
} from "@/lib/torneo-bracket";
import { fetchTorneoSeedNames } from "@/lib/firebase/torneo-seed";
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
    const octavosObj = state.matches || {};
    const resolved = resolveRoundMatches(OCTAVOS_IDS, octavosObj);
    const cuartosMatches = buildCuartosFromOctavosWinners(resolved.winners);
    const newState: TorneoState = {
      phase: PHASES.CUARTOS_VOTING,
      phaseStart: now,
      phaseEnd: now + TORNEO_PHASE_DURATION_MS,
      octavosWinners: resolved.winners.filter((w): w is string => w !== null),
      matches: resolved.updatedMatches,
      cuartosMatches,
    };
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
    const cuartosObj = state.cuartosMatches || {};
    const resolved = resolveRoundMatches(CUARTOS_IDS, cuartosObj);
    const semisMatches = buildSemisMatches(resolved.winners);
    const newState: TorneoState = {
      phase: PHASES.SEMIFINALS_VOTING,
      phaseStart: now,
      phaseEnd: now + TORNEO_PHASE_DURATION_MS,
      cuartosWinners: resolved.winners.filter((w): w is string => w !== null),
      cuartosMatches: resolved.updatedMatches,
      semisMatches,
    };
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
    const semisObj = state.semisMatches || {};
    const resolved = resolveRoundMatches(SEMIS_IDS, semisObj);
    const finalMatch = buildFinalMatch(resolved.winners);
    const newState: TorneoState = {
      phase: PHASES.FINAL_VOTING,
      phaseStart: now,
      phaseEnd: now + TORNEO_PHASE_DURATION_MS,
      semisWinners: resolved.winners.filter((w): w is string => w !== null),
      semisMatches: resolved.updatedMatches,
      finalMatch,
    };
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
    const newState: TorneoState = {
      phase: PHASES.FINAL_VOTING,
      phaseStart: now,
      phaseEnd: now + TORNEO_PHASE_DURATION_MS,
      finalMatch,
    };
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
    const newState: TorneoState = {
      phase: PHASES.TORNEO_ENDED,
      phaseStart: now,
      phaseEnd: getUpcomingTorneoStartMs(now + 60_000),
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

  if (state.phase === PHASES.WAITING_OCTAVOS) {
    const editionStart = getEditionStartMsForWeekContaining(now);
    if (now < editionStart && state.phaseEnd > now - 2000) return state;
  } else if (state.phaseEnd > now - 2000) {
    return state;
  }

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

  const votingEnd = getTorneoVotingCanonicalEndMs(existing, now);
  if (votingEnd != null && Math.abs(existing.phaseEnd - votingEnd) > 60_000) {
    const db = getAdminDatabase();
    await db.ref("torneo/state/phaseEnd").set(votingEnd);
    return { healed: true };
  }

  await advanceTorneoPhaseIfNeeded(existing, now);
  return { healed: true };
}
