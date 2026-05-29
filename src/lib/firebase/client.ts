import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue,
  push,
  runTransaction,
  type Database,
} from "firebase/database";
import { firebaseConfig, isFirebaseConfigured } from "./config";
import type { Ranker } from "@/data/rankers";

export type FirebaseBridge = {
  db: Database;
  ref: typeof ref;
  get: typeof get;
  set: typeof set;
  update: typeof update;
  onValue: typeof onValue;
  push: typeof push;
  runTransaction: typeof runTransaction;
  DEVICE_ID: string;
  getIPHash: () => Promise<string>;
  ensureRVExists: () => Promise<void>;
  castRVVoteDB: (name: string) => Promise<{
    ok: boolean;
    reason?: string;
    rv?: unknown;
  }>;
  resolveRVIfNeeded: (rv: Record<string, unknown>) => Promise<void>;
  createNewRVRound: () => Promise<unknown>;
  getRankedNamesFromOverrides: (overrides: Record<string, number>) => string[];
  getOrCreateEntryVote: () => Promise<Record<string, unknown>>;
  castEntryVoteDB: (candidateId: string) => Promise<boolean>;
  resolveEntryVoteInDB: (ev: Record<string, unknown>) => Promise<void>;
  getTorneoState: () => Promise<Record<string, unknown> | null>;
  initTorneoState: (state: Record<string, unknown>) => Promise<Record<string, unknown>>;
  updateTorneoState: (updates: Record<string, unknown>) => Promise<void>;
  castTorneoVote: (
    matchId: string,
    candidateName: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
  atomicAdvanceTorneoPhase: (
    expectedPhase: string,
    newState: Record<string, unknown>,
  ) => Promise<boolean>;
};

declare global {
  interface Window {
    FB?: FirebaseBridge;
    RANKERS?: Ranker[];
  }
}

let app: FirebaseApp | null = null;
let db: Database | null = null;

function getDeviceId(): string {
  if (typeof window === "undefined") return "dev_ssr";
  let id = localStorage.getItem("lm_device_id");
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
    try {
      localStorage.setItem("lm_device_id", id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

const DEVICE_ID = typeof window !== "undefined" ? getDeviceId() : "dev_ssr";
let cachedIPHash: string | null = null;

async function getIPHash(): Promise<string> {
  if (cachedIPHash) return cachedIPHash;
  try {
    const r = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(4000),
    });
    const d = (await r.json()) as { ip?: string };
    const ip = d.ip ?? "unknown";
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      hash = (hash << 5) - hash + ip.charCodeAt(i);
      hash |= 0;
    }
    cachedIPHash = "ip_" + Math.abs(hash).toString(36);
  } catch {
    cachedIPHash = "ip_fallback_" + DEVICE_ID;
  }
  return cachedIPHash;
}

function getRankedNamesFromOverrides(overrides: Record<string, number>): string[] {
  const names = (window.RANKERS ?? []).map((r) => r.name);
  if (!overrides || Object.keys(overrides).length === 0) return [...names];
  return [...names]
    .map((n, i) => ({
      name: n,
      pos: overrides[n] !== undefined ? Number(overrides[n]) : i,
    }))
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.name);
}

let unsubscribeAnnouncements: (() => void) | null = null;

function subscribeAnnouncements(database: Database): void {
  unsubscribeAnnouncements?.();
  unsubscribeAnnouncements = onValue(ref(database, "announcements"), (snap) => {
    document.querySelectorAll(".lm-global-ann").forEach((el) => el.remove());
    if (!snap.exists()) return;

    const anns = snap.val() as Record<
      string,
      {
        active?: boolean;
        expiresAt?: number;
        ts?: number;
        type?: string;
        text?: string;
      }
    >;
    const now = Date.now();

    const active = Object.values(anns)
      .filter((a) => a.active && (!a.expiresAt || a.expiresAt > now))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));

    const colors: Record<string, { bg: string; border: string; icon: string }> = {
      info: {
        bg: "rgba(59,130,246,.16)",
        border: "rgba(59,130,246,.55)",
        icon: "ℹ️",
      },
      warning: {
        bg: "rgba(249,115,22,.16)",
        border: "rgba(249,115,22,.55)",
        icon: "⚠️",
      },
      success: {
        bg: "rgba(46,204,113,.14)",
        border: "rgba(46,204,113,.55)",
        icon: "🏆",
      },
      emergency: {
        bg: "rgba(255,71,87,.16)",
        border: "rgba(255,71,87,.65)",
        icon: "🚨",
      },
    };

    active.forEach((ann) => {
      const c = colors[ann.type ?? ""] ?? colors.info;
      const el = document.createElement("div");
      el.className = "lm-global-ann";
      el.style.cssText = `
      background:${c.bg};
      border-bottom:2px solid ${c.border};
      padding:1.3rem 2rem;
      display:flex;
      align-items:center;
      justify-content:center;
      position:relative;
      z-index:200;
      backdrop-filter:blur(12px);
      animation:fadeUp .3s ease;
    `;
      const row = document.createElement("div");
      row.style.cssText =
        "display:flex;align-items:center;justify-content:center;gap:1rem;width:100%;text-align:center;";
      const icon = document.createElement("span");
      icon.style.fontSize = "2rem";
      icon.textContent = c.icon;
      const text = document.createElement("span");
      text.style.cssText =
        "font-size:1.35rem;font-weight:900;letter-spacing:.5px;color:var(--text);line-height:1.4;";
      text.textContent = ann.text ?? "";
      row.append(icon, text);
      const btn = document.createElement("button");
      btn.className = "ann-close";
      btn.type = "button";
      btn.textContent = "✕";
      el.append(row, btn);
      btn.style.cssText = `
      position:absolute;right:18px;top:50%;transform:translateY(-50%);
      background:none;border:none;color:var(--text2);font-size:1.4rem;font-weight:900;cursor:pointer;transition:.2s;
    `;
      btn.onclick = () => el.remove();
      const ticker = document.querySelector(".ticker-wrap");
      if (ticker) ticker.after(el);
      else document.body.prepend(el);
    });
  });
}

export async function initFirebaseClient(): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    console.warn("[LooksMax] Firebase no configurado. Copia .env.example a .env.local");
    return false;
  }

  if (typeof window !== "undefined" && window.FB) {
    return true;
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }

  if (!db) return false;

  async function createNewRVRound() {
    const names = (window.RANKERS ?? []).map((r) => r.name);
    const i1 = Math.floor(Math.random() * names.length);
    let i2: number;
    do {
      i2 = Math.floor(Math.random() * names.length);
    } while (i2 === i1);
    const newRV = {
      id: "rv_" + Date.now(),
      p1: names[i1],
      p2: names[i2],
      votes: { [names[i1]]: 0, [names[i2]]: 0 },
      endTime: Date.now() + 6 * 60 * 60 * 1000,
      resolved: false,
      resolving: false,
    };
    await set(ref(db!, "rankvote/current"), newRV);
    return newRV;
  }

  async function ensureRVExists() {
    const snap = await get(ref(db!, "rankvote/current"));
    if (snap.exists()) {
      const rv = snap.val() as { resolved?: boolean; endTime: number };
      if (rv.resolved) {
        await createNewRVRound();
        return;
      }
      if (rv.endTime > Date.now()) return;
      await resolveRVIfNeeded(rv as Record<string, unknown>);
    } else {
      await createNewRVRound();
    }
  }

  async function resolveRVIfNeeded(rv: Record<string, unknown>) {
    if (!rv || rv.resolved) return;
    if ((rv.endTime as number) > Date.now()) return;

    const resolvingRef = ref(db!, "rankvote/current/resolving");
    let claimed = false;
    try {
      await runTransaction(resolvingRef, (cur) => {
        if (cur === true) return;
        claimed = true;
        return true;
      });
    } catch {
      return;
    }
    if (!claimed) return;

    const freshSnap = await get(ref(db!, "rankvote/current"));
    if (!freshSnap.exists()) {
      await createNewRVRound();
      return;
    }
    const fresh = freshSnap.val() as Record<string, unknown>;
    if (fresh.resolved) return;

    const ovSnap = await get(ref(db!, "rankOverrides"));
    const overrides = ovSnap.exists() ? (ovSnap.val() as Record<string, number>) : {};

    const p1 = fresh.p1 as string;
    const p2 = fresh.p2 as string;
    const votes = fresh.votes as Record<string, number> | undefined;
    const v1 = votes?.[p1] || 0;
    const v2 = votes?.[p2] || 0;
    const tsNow = Date.now();

    if (v1 === 0 && v2 === 0) {
      await set(ref(db!, "rankvote/current/resolved"), true);
      await Promise.all([
        push(ref(db!, "rankvoteHistory"), {
          winner: "empate",
          loser: "empate",
          wVotes: 0,
          lVotes: 0,
          ts: tsNow,
        }),
        createNewRVRound(),
      ]);
      return;
    }

    const winner = v1 >= v2 ? p1 : p2;
    const loser = winner === p1 ? p2 : p1;
    const wVotes = winner === p1 ? v1 : v2;
    const lVotes = winner === p1 ? v2 : v1;

    const ranked = getRankedNamesFromOverrides(overrides);
    let winnerIdx = ranked.indexOf(winner);
    let loserIdx = ranked.indexOf(loser);

    if (winnerIdx === -1 || loserIdx === -1) {
      await set(ref(db!, "rankvote/current/resolved"), true);
      await Promise.all([
        push(ref(db!, "rankvoteHistory"), {
          winner,
          loser,
          wVotes,
          lVotes,
          error: "not_found",
          ts: tsNow,
        }),
        createNewRVRound(),
      ]);
      return;
    }

    const newRanked = [...ranked];

    if (winnerIdx > 0) {
      const tmp = newRanked[winnerIdx - 1];
      newRanked[winnerIdx - 1] = winner;
      newRanked[winnerIdx] = tmp;
      winnerIdx = winnerIdx - 1;
    }

    loserIdx = newRanked.indexOf(loser);

    if (loserIdx < newRanked.length - 1) {
      const tmp = newRanked[loserIdx + 1];
      newRanked[loserIdx + 1] = loser;
      newRanked[loserIdx] = tmp;
    }

    (window.RANKERS ?? []).forEach((r) => {
      if (!newRanked.includes(r.name)) newRanked.push(r.name);
    });

    const newOverrides: Record<string, number> = {};
    newRanked.forEach((name, idx) => {
      newOverrides[name] = idx;
    });

    const winnerOrigIdx = ranked.indexOf(winner);
    const loserOrigIdx = ranked.indexOf(loser);
    const winnerFinalIdx = newRanked.indexOf(winner);
    const loserFinalIdx = newRanked.indexOf(loser);

    const movUpdates: Record<string, { dir: string; delta: number; ts: number }> = {};
    if (winnerFinalIdx < winnerOrigIdx)
      movUpdates[winner] = {
        dir: "up",
        delta: winnerOrigIdx - winnerFinalIdx,
        ts: tsNow,
      };
    if (loserFinalIdx > loserOrigIdx)
      movUpdates[loser] = {
        dir: "down",
        delta: loserFinalIdx - loserOrigIdx,
        ts: tsNow,
      };

    const batch: Record<string, unknown> = { rankOverrides: newOverrides };
    if (Object.keys(movUpdates).length > 0) {
      const movSnap = await get(ref(db!, "rankMovements"));
      const movements = movSnap.exists()
        ? (movSnap.val() as Record<string, unknown>)
        : {};
      Object.assign(movements, movUpdates);
      batch.rankMovements = movements;
    }

    await Promise.all([
      update(ref(db!, "/"), batch),
      push(ref(db!, "rankvoteHistory"), {
        winner,
        loser,
        wVotes,
        lVotes,
        winnerPos: winnerOrigIdx + 1,
        loserPos: loserOrigIdx + 1,
        winnerNewPos: winnerFinalIdx + 1,
        loserNewPos: loserFinalIdx + 1,
        ts: tsNow,
      }),
      set(ref(db!, "rankvote/current/resolved"), true),
    ]).then(() => createNewRVRound());
  }

  async function castRVVoteDB(name: string) {
    const snap = await get(ref(db!, "rankvote/current"));
    if (!snap.exists()) return { ok: false, reason: "no_round" };
    const rv = snap.val() as {
      id: string;
      resolved?: boolean;
      endTime: number;
      p1: string;
      p2: string;
    };
    if (rv.resolved) return { ok: false, reason: "resolved" };
    if (rv.endTime <= Date.now()) return { ok: false, reason: "expired" };
    if (name !== rv.p1 && name !== rv.p2)
      return { ok: false, reason: "invalid_candidate" };

    const localKey = "rvVote_" + rv.id;
    try {
      if (localStorage.getItem(localKey)) return { ok: false, reason: "already_voted" };
    } catch {
      /* ignore */
    }

    const devSnap = await get(ref(db!, "rankvoteVotes/dev_" + DEVICE_ID + "_" + rv.id));
    if (devSnap.exists()) {
      try {
        localStorage.setItem(localKey, name);
      } catch {
        /* ignore */
      }
      return { ok: false, reason: "already_voted" };
    }

    const ipHash = await getIPHash();
    const ipSnap = await get(ref(db!, "rankvoteVotes/ip_" + ipHash + "_" + rv.id));
    if (ipSnap.exists()) {
      try {
        localStorage.setItem(localKey, name);
      } catch {
        /* ignore */
      }
      return { ok: false, reason: "already_voted" };
    }

    try {
      localStorage.setItem(localKey, name);
    } catch {
      /* ignore */
    }
    try {
      await runTransaction(
        ref(db!, "rankvote/current/votes/" + name),
        (cur) => (cur || 0) + 1,
      );
      const writes: Record<string, unknown> = {};
      writes["rankvoteVotes/dev_" + DEVICE_ID + "_" + rv.id] = {
        candidate: name,
        ts: Date.now(),
      };
      writes["rankvoteVotes/ip_" + ipHash + "_" + rv.id] = {
        candidate: name,
        ts: Date.now(),
      };
      await update(ref(db!, "/"), writes);
      return { ok: true, rv };
    } catch {
      try {
        localStorage.removeItem(localKey);
      } catch {
        /* ignore */
      }
      return { ok: false, reason: "transaction_failed" };
    }
  }

  async function getOrCreateEntryVote() {
    const evRef = ref(db!, "entryVote/current");
    const snap = await get(evRef);
    const DEADLINE = new Date("2026-06-12T22:30:00+02:00").getTime();
    const now = Date.now();
    if (snap.exists()) {
      const ev = snap.val() as {
        winner?: string;
        endTime: number;
      };
      if (ev.winner) return ev;
      if (ev.endTime > now) return ev;
      await resolveEntryVoteInDB(ev as Record<string, unknown>);
      const snap2 = await get(evRef);
      return snap2.exists() ? snap2.val() : ev;
    }
    const newEV = {
      id: "ev_reset_" + Date.now(),
      votes: { franbv: 0, nilojeda: 0 },
      endTime: DEADLINE,
      winner: null,
    };
    await set(evRef, newEV);
    return newEV;
  }

  async function resolveEntryVoteInDB(ev: Record<string, unknown>) {
    if (ev.winner) return;
    const votes = ev.votes as Record<string, number> | undefined;
    const v1 = votes?.franbv || 0;
    const v2 = votes?.nilojeda || 0;
    if (v1 + v2 === 0) return;
    const winnerId = v1 >= v2 ? "franbv" : "nilojeda";
    await update(ref(db!, "entryVote/current"), {
      winner: winnerId,
      resolved: true,
    });
  }

  async function castEntryVoteDB(candidateId: string) {
    const evSnap = await get(ref(db!, "entryVote/current"));
    if (!evSnap.exists()) return false;
    const ev = evSnap.val() as {
      id: string;
      winner?: string;
      endTime: number;
    };
    if (ev.winner) return false;
    if (ev.endTime <= Date.now()) return false;

    const voteKey = "evVotes_" + ev.id;
    try {
      if (localStorage.getItem(voteKey)) return false;
    } catch {
      /* ignore */
    }

    const devSnap = await get(ref(db!, `entryVotes/dev_${DEVICE_ID}_${ev.id}`));
    if (devSnap.exists()) return false;

    const ipHash = await getIPHash();
    const ipSnap = await get(ref(db!, `entryVotes/ip_${ipHash}_${ev.id}`));
    if (ipSnap.exists()) return false;

    try {
      localStorage.setItem(voteKey, candidateId);
    } catch {
      /* ignore */
    }
    try {
      await runTransaction(
        ref(db!, `entryVote/current/votes/${candidateId}`),
        (cur) => (cur || 0) + 1,
      );
      const writes: Record<string, unknown> = {};
      writes[`entryVotes/dev_${DEVICE_ID}_${ev.id}`] = {
        candidate: candidateId,
        ts: Date.now(),
      };
      writes[`entryVotes/ip_${ipHash}_${ev.id}`] = {
        candidate: candidateId,
        ts: Date.now(),
      };
      await update(ref(db!, "/"), writes);
      return true;
    } catch {
      try {
        localStorage.removeItem(voteKey);
      } catch {
        /* ignore */
      }
      return false;
    }
  }

  async function getTorneoState() {
    const snap = await get(ref(db!, "torneo/state"));
    return snap.exists() ? (snap.val() as Record<string, unknown>) : null;
  }

  async function initTorneoState(state: Record<string, unknown>) {
    await set(ref(db!, "torneoVotes"), null);
    await set(ref(db!, "torneo/state"), state);
    return state;
  }

  async function updateTorneoState(updates: Record<string, unknown>) {
    await update(ref(db!, "torneo/state"), updates);
  }

  async function atomicAdvanceTorneoPhase(
    expectedPhase: string,
    newState: Record<string, unknown>,
  ) {
    const phaseRef = ref(db!, "torneo/state/phase");
    let advanced = false;
    try {
      await runTransaction(phaseRef, (cur) => {
        if (cur !== expectedPhase) return;
        advanced = true;
        return newState.phase;
      });
    } catch {
      return false;
    }
    if (!advanced) return false;
    await update(ref(db!, "torneo/state"), newState);
    return true;
  }

  async function castTorneoVote(matchId: string, candidateName: string) {
    const stateSnapPre = await get(ref(db!, "torneo/state"));
    const torneoCreatedAt = stateSnapPre.exists()
      ? ((stateSnapPre.val() as { createdAt?: number }).createdAt ?? 0)
      : 0;
    const localKey = "torneoVote_" + torneoCreatedAt + "_" + matchId;
    try {
      if (localStorage.getItem(localKey)) return { ok: false, reason: "already_voted" };
    } catch {
      /* ignore */
    }

    const devSnap = await get(ref(db!, `torneoVotes/dev_${DEVICE_ID}_${matchId}`));
    if (devSnap.exists()) {
      try {
        localStorage.setItem(localKey, candidateName);
      } catch {
        /* ignore */
      }
      return { ok: false, reason: "already_voted" };
    }

    const ipHash = await getIPHash();
    const ipSnap = await get(ref(db!, `torneoVotes/ip_${ipHash}_${matchId}`));
    if (ipSnap.exists()) {
      try {
        localStorage.setItem(localKey, candidateName);
      } catch {
        /* ignore */
      }
      return { ok: false, reason: "already_voted" };
    }

    try {
      localStorage.setItem(localKey, candidateName);
    } catch {
      /* ignore */
    }
    try {
      const stateSnap = await get(ref(db!, "torneo/state"));
      if (!stateSnap.exists()) return { ok: false, reason: "no_state" };
      const st = stateSnap.val() as Record<string, unknown>;
      let votePath: string;
      const matches = st.matches as Record<string, unknown> | undefined;
      const cuartosMatches = st.cuartosMatches as Record<string, unknown> | undefined;
      const semisMatches = st.semisMatches as Record<string, unknown> | undefined;
      const finalMatch = st.finalMatch as { id?: string } | undefined;

      if (matches?.[matchId]) {
        votePath = `torneo/state/matches/${matchId}/votes/${candidateName}`;
      } else if (cuartosMatches?.[matchId]) {
        votePath = `torneo/state/cuartosMatches/${matchId}/votes/${candidateName}`;
      } else if (semisMatches?.[matchId]) {
        votePath = `torneo/state/semisMatches/${matchId}/votes/${candidateName}`;
      } else if (finalMatch?.id === matchId) {
        votePath = `torneo/state/finalMatch/votes/${candidateName}`;
      } else {
        return { ok: false, reason: "match_not_found" };
      }

      await runTransaction(ref(db!, votePath), (cur) => (cur || 0) + 1);
      const writes: Record<string, unknown> = {};
      writes[`torneoVotes/dev_${DEVICE_ID}_${matchId}`] = {
        candidate: candidateName,
        ts: Date.now(),
      };
      writes[`torneoVotes/ip_${ipHash}_${matchId}`] = {
        candidate: candidateName,
        ts: Date.now(),
      };
      await update(ref(db!, "/"), writes);
      return { ok: true };
    } catch {
      try {
        localStorage.removeItem(localKey);
      } catch {
        /* ignore */
      }
      return { ok: false, reason: "transaction_failed" };
    }
  }

  window.FB = {
    db,
    ref,
    get,
    set,
    update,
    onValue,
    push,
    runTransaction,
    DEVICE_ID,
    getIPHash,
    ensureRVExists,
    castRVVoteDB,
    resolveRVIfNeeded,
    createNewRVRound,
    getRankedNamesFromOverrides,
    getOrCreateEntryVote,
    castEntryVoteDB,
    resolveEntryVoteInDB,
    getTorneoState,
    initTorneoState,
    updateTorneoState,
    castTorneoVote,
    atomicAdvanceTorneoPhase,
  };

  subscribeAnnouncements(db);
  window.dispatchEvent(new Event("firebase-ready"));
  return true;
}
