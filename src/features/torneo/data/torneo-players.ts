import { creatorImage } from "@/assets/creators";
import type { CreatorPhoto } from "@/assets/creators";
import type { FirebaseBridge } from "@/lib/firebase/client";
import type {
  OctavosMatchDef,
  TorneoMatch,
  TorneoPhase,
  TorneoPlayer,
  TorneoState,
} from "@/features/shared/lib/types";

export const TORNEO_PLAYERS: TorneoPlayer[] = [
  { name: "Aaronjaureguii", photo: creatorImage("aaronjaureguii.webp"), icon: "star" },
  { name: "Peereira7", photo: creatorImage("peereira7.webp"), icon: "goal" },
  { name: "TitoChape", photo: creatorImage("titochape.webp"), icon: "cookie" },
  {
    name: "RubenMaxxing",
    photo: creatorImage("rubenmaxxing.webp"),
    icon: "microscope",
  },
  { name: "Kappah", photo: creatorImage("kappah.webp"), icon: "crown" },
  { name: "Sergi", photo: creatorImage("SergiCabrer.webp"), icon: "waves" },
  { name: "JoseNogales", photo: creatorImage("josenogales.webp"), icon: "leaf" },
  { name: "Franbv", photo: creatorImage("franbeuve.webp"), icon: "drama" },
  { name: "Elcalvo", photo: creatorImage("elcalvo.webp"), icon: "brain" },
  { name: "Febron", photo: creatorImage("febron.webp"), icon: "dumbbell" },
  { name: "Didac", photo: creatorImage("didac.webp"), icon: "target" },
  { name: "Giva", photo: creatorImage("giva.webp"), icon: "flame" },
  { name: "Javichu", photo: creatorImage("javichu.webp"), icon: "zap" },
  { name: "Ismael", photo: creatorImage("ismael.webp"), icon: "sparkles" },
  { name: "AlvaroSapo", photo: creatorImage("alvaro.webp"), icon: "turtle" },
  { name: "Hectrollprox", photo: creatorImage("hectroll.webp"), icon: "ghost" },
];

export const OCTAVOS_MATCHES: OctavosMatchDef[] = [
  { id: "oct_0", p1: TORNEO_PLAYERS[0], p2: TORNEO_PLAYERS[1] },
  { id: "oct_1", p1: TORNEO_PLAYERS[2], p2: TORNEO_PLAYERS[12] },
  { id: "oct_2", p1: TORNEO_PLAYERS[4], p2: TORNEO_PLAYERS[5] },
  { id: "oct_3", p1: TORNEO_PLAYERS[6], p2: TORNEO_PLAYERS[7] },
  { id: "oct_4", p1: TORNEO_PLAYERS[8], p2: TORNEO_PLAYERS[9] },
  { id: "oct_5", p1: TORNEO_PLAYERS[10], p2: TORNEO_PLAYERS[11] },
  { id: "oct_6", p1: TORNEO_PLAYERS[3], p2: TORNEO_PLAYERS[13] },
  { id: "oct_7", p1: TORNEO_PLAYERS[14], p2: TORNEO_PLAYERS[15] },
];

export const WAIT_BEFORE_OCTAVOS = 10 * 60 * 1000;
export const VOTING_DURATION = 30 * 60 * 1000;
export const BREAK_BETWEEN_ROUNDS = 5 * 60 * 1000;

export const PHASES = {
  WAITING_OCTAVOS: "waiting_octavos",
  OCTAVOS_VOTING: "octavos_voting",
  BREAK_CUARTOS: "break_cuartos",
  CUARTOS_VOTING: "cuartos_voting",
  SEMIFINALS_PROMO: "semifinals_promo",
  SEMIFINALS_VOTING: "semifinals_voting",
  BREAK_FINAL: "break_final",
  FINAL_VOTING: "final_voting",
  TORNEO_ENDED: "torneo_ended",
} as const satisfies Record<string, TorneoPhase>;

const OCTAVOS_IDS = [
  "oct_0",
  "oct_1",
  "oct_2",
  "oct_3",
  "oct_4",
  "oct_5",
  "oct_6",
  "oct_7",
] as const;
const CUARTOS_IDS = ["cua_0", "cua_1", "cua_2", "cua_3"] as const;
const SEMIS_IDS = ["semi_0", "semi_1"] as const;

let _torneoAdvancing = false;

function cloneMatches<T>(obj: T): T {
  return structuredClone(obj);
}

export function getPlayerByName(name: string): TorneoPlayer {
  return (
    TORNEO_PLAYERS.find((p) => p.name === name) ?? {
      name,
      photo: creatorImage("kappah.webp"),
      icon: "help-circle",
    }
  );
}

/** Estado inicial cuando termina la cuenta atrás (cuartos directo, sin octavos en UI). */
export function getInitialTorneoState(now: number): TorneoState {
  const cuartosMatches: Record<string, TorneoMatch> = {};
  for (let i = 0; i < 4; i++) {
    const id = `cua_${i}`;
    const p1 = TORNEO_PLAYERS[i * 2];
    const p2 = TORNEO_PLAYERS[i * 2 + 1];
    cuartosMatches[id] = {
      id,
      round: "cuartos",
      p1: p1.name,
      p2: p2.name,
      votes: { _placeholder_: 0 },
      winner: null,
      resolved: false,
    };
  }
  return {
    phase: PHASES.CUARTOS_VOTING,
    phaseStart: now,
    phaseEnd: now + VOTING_DURATION,
    cuartosMatches,
    octavosWinners: null,
    cuartosWinners: null,
    createdAt: now,
  };
}

export function createWaitingTorneoState(now = Date.now()): TorneoState {
  const target23 = new Date(now);
  target23.setHours(23, 0, 0, 0);
  if (now >= target23.getTime()) {
    target23.setDate(target23.getDate() + 1);
  }
  return {
    phase: PHASES.WAITING_OCTAVOS,
    phaseEnd: target23.getTime(),
    phaseStart: now,
    nextPhaseLabel: "Cuartos de Final",
    createdAt: now,
  };
}

export function resolveOctavosMatches(matchesObj: Record<string, TorneoMatch>): {
  winners: (string | null)[];
  updatedMatches: Record<string, TorneoMatch>;
} {
  const updatedMatches = cloneMatches(matchesObj);
  const winners: (string | null)[] = [];
  OCTAVOS_IDS.forEach((id) => {
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

export function buildCuartosMatches(
  winners: (string | null)[],
): Record<string, TorneoMatch> {
  const cuartos: Record<string, TorneoMatch> = {};
  for (let i = 0; i < 4; i++) {
    const id = `cua_${i}`;
    const p1name = winners[i * 2] || "TBD";
    const p2name = winners[i * 2 + 1] || "TBD";
    cuartos[id] = {
      id,
      round: "cuartos",
      p1: p1name,
      p2: p2name,
      votes: { _placeholder_: 0 },
      winner: null,
      resolved: false,
    };
  }
  return cuartos;
}

export function resolveCuartosMatches(cuartosObj: Record<string, TorneoMatch>): {
  winners: (string | null)[];
  updatedMatches: Record<string, TorneoMatch>;
} {
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

export function buildSemisMatches(
  winners: (string | null)[],
): Record<string, TorneoMatch> {
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

export function resolveSemisMatches(semisObj: Record<string, TorneoMatch>): {
  winners: (string | null)[];
  updatedMatches: Record<string, TorneoMatch>;
} {
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

export function buildFinalMatch(winners: (string | null)[]): TorneoMatch {
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

async function doAdvanceTorneoPhase(
  fb: FirebaseBridge,
  state: TorneoState,
  now: number,
): Promise<TorneoState> {
  if (state.phase === PHASES.WAITING_OCTAVOS) {
    const fresh = getInitialTorneoState(now);
    await fb.initTorneoState(fresh as Record<string, unknown>);
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
    const ok = await fb.atomicAdvanceTorneoPhase(
      PHASES.CUARTOS_VOTING,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await fb.getTorneoState();
      return (fresh as TorneoState | null) ?? state;
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
    const ok = await fb.atomicAdvanceTorneoPhase(
      PHASES.SEMIFINALS_PROMO,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await fb.getTorneoState();
      return (fresh as TorneoState | null) ?? state;
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
    const ok = await fb.atomicAdvanceTorneoPhase(
      PHASES.SEMIFINALS_VOTING,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await fb.getTorneoState();
      return (fresh as TorneoState | null) ?? state;
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
    const ok = await fb.atomicAdvanceTorneoPhase(
      PHASES.BREAK_FINAL,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await fb.getTorneoState();
      return (fresh as TorneoState | null) ?? state;
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
    const ok = await fb.atomicAdvanceTorneoPhase(
      PHASES.FINAL_VOTING,
      newState as Record<string, unknown>,
    );
    if (!ok) {
      const fresh = await fb.getTorneoState();
      return (fresh as TorneoState | null) ?? state;
    }
    return { ...state, ...newState };
  }

  return state;
}

export async function advanceTorneoPhaseIfNeeded(
  fb: FirebaseBridge,
  state: TorneoState | null | undefined,
  now = Date.now(),
): Promise<TorneoState | null | undefined> {
  if (!state) return state;
  if (state.phaseEnd > now - 2000) return state;

  if (_torneoAdvancing) {
    await new Promise((r) => setTimeout(r, 1500));
    const fresh = await fb.getTorneoState();
    return (fresh as TorneoState | null) ?? state;
  }

  _torneoAdvancing = true;
  try {
    return await doAdvanceTorneoPhase(fb, state, now);
  } catch (e) {
    console.error("advanceTorneoPhaseIfNeeded error:", e);
    return state;
  } finally {
    setTimeout(() => {
      _torneoAdvancing = false;
    }, 3000);
  }
}

export async function ensureTorneoState(
  fb: FirebaseBridge,
  now = Date.now(),
): Promise<TorneoState> {
  const existing = (await fb.getTorneoState()) as TorneoState | null;
  if (existing) {
    if (existing.phase === PHASES.WAITING_OCTAVOS && existing.phaseEnd > now) {
      return existing;
    }
    const advanced = await advanceTorneoPhaseIfNeeded(fb, existing, now);
    return advanced ?? existing;
  }

  const waitingState = createWaitingTorneoState(now);
  await fb.initTorneoState(waitingState as Record<string, unknown>);
  return waitingState;
}

/** Libera el mutex interno de avance (útil en tests). */
export function resetTorneoAdvancingFlag(): void {
  _torneoAdvancing = false;
}
