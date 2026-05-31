import { getInitialTorneoState, PHASES } from "@/features/torneo/data/torneo-players";
import { getNextMadrid23Ms } from "@/lib/spain-time";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";
import { getAdminDatabase } from "./admin";

const CUARTOS_IDS = ["cua_0", "cua_1", "cua_2", "cua_3"] as const;
const SEMIS_IDS = ["semi_0", "semi_1"] as const;

let torneoAdvancing = false;

function cloneMatches<T>(obj: T): T {
  return structuredClone(obj);
}

function createWaitingTorneoState(now = Date.now()): TorneoState {
  const phaseEnd = getNextMadrid23Ms(now);
  return {
    phase: PHASES.WAITING_OCTAVOS,
    phaseEnd,
    phaseStart: now,
    nextPhaseLabel: "Cuartos de Final",
    createdAt: now,
  };
}

function resolveCuartosMatches(cuartosObj: Record<string, TorneoMatch>) {
  const updatedMatches = cloneMatches(cuartosObj);
  const winners: (string | null)[] = [];
  CUARTOS_IDS.forEach((id) => {
    const m = updatedMatches[id];
    if (!m) {
      winners.push(null);
      return;
    }
    const v1 = m.votes?.[m.p1] || 0;
    const v2 = m.votes?.[m.p2] || 0;
    const winner = v1 >= v2 ? m.p1 : m.p2;
    m.winner = winner;
    m.resolved = true;
    winners.push(winner);
  });
  return { winners, updatedMatches };
}

function buildSemisMatches(winners: (string | null)[]): Record<string, TorneoMatch> {
  const semis: Record<string, TorneoMatch> = {};
  for (let i = 0; i < 2; i++) {
    const id = `semi_${i}`;
    const p1name = winners[i * 2] || "TBD";
    const p2name = winners[i * 2 + 1] || "TBD";
    semis[id] = {
      id,
      round: "semis",
      p1: p1name,
      p2: p2name,
      votes: { _placeholder_: 0 },
      winner: null,
      resolved: false,
    };
  }
  return semis;
}

function resolveSemisMatches(semisObj: Record<string, TorneoMatch>) {
  const updatedMatches = cloneMatches(semisObj);
  const winners: (string | null)[] = [];
  SEMIS_IDS.forEach((id) => {
    const m = updatedMatches[id];
    if (!m) {
      winners.push(null);
      return;
    }
    const v1 = m.votes?.[m.p1] || 0;
    const v2 = m.votes?.[m.p2] || 0;
    const winner = v1 >= v2 ? m.p1 : m.p2;
    m.winner = winner;
    m.resolved = true;
    winners.push(winner);
  });
  return { winners, updatedMatches };
}

function buildFinalMatch(winners: (string | null)[]): TorneoMatch {
  const p1name = winners[0] || "TBD";
  const p2name = winners[1] || "TBD";
  return {
    id: "final_0",
    round: "final",
    p1: p1name,
    p2: p2name,
    votes: { _placeholder_: 0 },
    winner: null,
    resolved: false,
  };
}

const VOTING_DURATION = 30 * 60 * 1000;
const BREAK_BETWEEN_ROUNDS = 5 * 60 * 1000;

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

async function doAdvanceTorneoPhase(
  state: TorneoState,
  now: number,
): Promise<TorneoState> {
  if (state.phase === PHASES.WAITING_OCTAVOS) {
    const fresh = getInitialTorneoState(now);
    await initTorneoState(fresh as Record<string, unknown>);
    return fresh;
  }

  if (state.phase === PHASES.CUARTOS_VOTING) {
    const cuartosObj = state.cuartosMatches || {};
    const resolved = resolveCuartosMatches(cuartosObj);
    const semisMatches = buildSemisMatches(resolved.winners);
    const newState: TorneoState = {
      phase: PHASES.SEMIFINALS_VOTING,
      phaseStart: now,
      phaseEnd: now + VOTING_DURATION,
      cuartosWinners: resolved.winners.filter((w): w is string => w !== null),
      cuartosMatches: resolved.updatedMatches,
      semisMatches,
    };
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.CUARTOS_VOTING,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return { ...state, ...newState };
  }

  if (state.phase === PHASES.SEMIFINALS_PROMO) {
    const semisWinners = state.cuartosWinners || [];
    const semisMatches = buildSemisMatches(semisWinners);
    const newState: TorneoState = {
      phase: PHASES.SEMIFINALS_VOTING,
      phaseStart: now,
      phaseEnd: now + VOTING_DURATION,
      semisMatches,
    };
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.SEMIFINALS_PROMO,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return { ...state, ...newState };
  }

  if (state.phase === PHASES.SEMIFINALS_VOTING) {
    const semisObj = state.semisMatches || {};
    const resolved = resolveSemisMatches(semisObj);
    const newState: TorneoState = {
      phase: PHASES.BREAK_FINAL,
      phaseStart: now,
      phaseEnd: now + BREAK_BETWEEN_ROUNDS,
      semisWinners: resolved.winners.filter((w): w is string => w !== null),
      semisMatches: resolved.updatedMatches,
    };
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.SEMIFINALS_VOTING,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return { ...state, ...newState };
  }

  if (state.phase === PHASES.BREAK_FINAL) {
    const semisWinners = state.semisWinners || [];
    const finalMatch = buildFinalMatch(semisWinners);
    const newState: TorneoState = {
      phase: PHASES.FINAL_VOTING,
      phaseStart: now,
      phaseEnd: now + VOTING_DURATION,
      finalMatch,
    };
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.BREAK_FINAL,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return { ...state, ...newState };
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
      phaseEnd: now + 999 * 24 * 60 * 60 * 1000,
      champion,
      finalMatch: updatedFinal,
    };
    const ok = await atomicAdvanceTorneoPhase(
      PHASES.FINAL_VOTING,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await getTorneoState();
      return fresh ?? state;
    }
    return { ...state, ...newState };
  }

  return state;
}

async function advanceTorneoPhaseIfNeeded(
  state: TorneoState | null,
  now = Date.now(),
): Promise<TorneoState | null> {
  if (!state) return state;
  if (state.phaseEnd > now - 2000) return state;

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

  if (options?.restartIfEnded && existing.phase === PHASES.TORNEO_ENDED) {
    const fresh = getInitialTorneoState(now);
    await initTorneoState(fresh as Record<string, unknown>);
    return { healed: true };
  }

  if (existing.phase === PHASES.WAITING_OCTAVOS && existing.phaseEnd > now) {
    return { healed: false };
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

export { getTorneoState, initTorneoState, getInitialTorneoState };
