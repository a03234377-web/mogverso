import {
  buildOctavosTorneoState,
  createWaitingTorneoState,
  PHASES,
} from "@/features/torneo/data/torneo-players";
import {
  getEditionEndMs,
  getEditionStartMsForWeekContaining,
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

async function initTorneoState(state: Record<string, unknown>) {
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

export async function startTorneoOctavosFromSeed(
  now = Date.now(),
): Promise<TorneoState> {
  const seedNames = await fetchTorneoSeedNames();
  const editionStartMs = getUpcomingTorneoStartMs(now);
  const fresh = buildOctavosTorneoState(now, seedNames, editionStartMs);
  await initTorneoState(fresh as Record<string, unknown>);
  return fresh;
}

async function doAdvanceTorneoPhase(
  state: TorneoState,
  now: number,
): Promise<TorneoState> {
  if (state.phase === PHASES.WAITING_OCTAVOS) {
    const fresh = await startTorneoOctavosFromSeed(now);
    return fresh;
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

export async function advanceTorneoPhaseNow(): Promise<TorneoState | null> {
  const state = await getTorneoState();
  if (!state) return null;
  return doAdvanceTorneoPhase(state, Date.now());
}

export async function fastForwardTorneoPhase(): Promise<TorneoState | null> {
  const db = getAdminDatabase();
  const state = await getTorneoState();
  if (!state) return null;
  if (state.phase === PHASES.WAITING_OCTAVOS || state.phase === PHASES.TORNEO_ENDED) {
    return healTorneo().then(() => getTorneoState());
  }
  await db.ref("torneo/state/phaseEnd").set(Date.now() - 1000);
  await healTorneo();
  return getTorneoState();
}

export async function clearTorneoVotes(): Promise<void> {
  const db = getAdminDatabase();
  await db.ref("torneoVotes").set(null);
}

async function advanceTorneoPhaseIfNeeded(
  state: TorneoState | null,
  now = Date.now(),
): Promise<TorneoState | null> {
  if (!state) return state;

  if (state.phase === PHASES.WAITING_OCTAVOS) {
    const editionStart = getEditionStartMsForWeekContaining(now);
    const inEditionWindow = now >= editionStart && now < getEditionEndMs(editionStart);
    if (!inEditionWindow && state.phaseEnd > now - 2000) return state;
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
    await initTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  const editionStart = getUpcomingTorneoStartMs(now);

  if (shouldForceTorneoWaitingBeforeStart(now, existing.phase)) {
    const waiting = createWaitingTorneoState(now);
    await initTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (
    now < editionStart &&
    (existing.phase !== PHASES.WAITING_OCTAVOS ||
      Math.abs(existing.phaseEnd - editionStart) > 60_000)
  ) {
    const waiting = createWaitingTorneoState(now);
    await initTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (options?.restartIfEnded && existing.phase === PHASES.TORNEO_ENDED) {
    const waiting = createWaitingTorneoState(now);
    await initTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (
    existing.phase === PHASES.BREAK_FINAL &&
    (!existing.semisMatches || Object.keys(existing.semisMatches).length === 0)
  ) {
    const waiting = createWaitingTorneoState(now);
    await initTorneoState(waiting as Record<string, unknown>);
    return { healed: true };
  }

  if (existing.phase === PHASES.WAITING_OCTAVOS) {
    const editionStart = getEditionStartMsForWeekContaining(now);
    if (now < editionStart) {
      if (Math.abs(existing.phaseEnd - editionStart) > 60_000) {
        const waiting = createWaitingTorneoState(now);
        await initTorneoState(waiting as Record<string, unknown>);
        return { healed: true };
      }
      return { healed: false };
    }
  }

  await advanceTorneoPhaseIfNeeded(existing, now);
  return { healed: true };
}

export async function adminInitTorneo(state: Record<string, unknown>) {
  await initTorneoState(state);
}

export async function adminResetTorneo() {
  const waiting = createWaitingTorneoState(Date.now());
  await initTorneoState(waiting as Record<string, unknown>);
  return waiting;
}

export {
  getTorneoState,
  initTorneoState,
  startTorneoOctavosFromSeed as getInitialTorneoState,
};
