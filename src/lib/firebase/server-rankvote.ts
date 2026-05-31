import { RANKERS } from "@/features/rankings/data/rankers";
import { prependMoverStack } from "@/features/rankings/lib/ranking";
import { isValidRankVotePair } from "@/features/rankings/lib/ranker-name";
import { coerceVoteCount } from "@/lib/coerce-vote-count";
import { VOTE_ROUND_MS } from "@/lib/vote-intervals";
import type { MoverStack } from "@/types/looksmax";
import { getAdminDatabase } from "./admin";
import { getRankedNamesFromOverrides } from "./rank-overrides";

let healChain: Promise<void> = Promise.resolve();

function enqueueHeal<T>(fn: () => Promise<T>): Promise<T> {
  const task = healChain.then(fn, fn);
  healChain = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

async function createNewRVRound() {
  const db = getAdminDatabase();
  const names = RANKERS.map((r) => r.name);
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
    endTime: Date.now() + VOTE_ROUND_MS,
    resolved: false,
    resolving: false,
  };
  await db.ref("rankvote/current").set(newRV);
  return newRV;
}

async function ensureActiveRVRoundOnServer() {
  const db = getAdminDatabase();
  const snap = await db.ref("rankvote/current").get();
  if (!snap.exists()) {
    await createNewRVRound();
    return;
  }
  const rv = snap.val() as {
    p1: string;
    p2: string;
    resolved?: boolean;
    endTime: number;
  };
  if (rv.resolved !== true && rv.endTime > Date.now()) {
    if (!isValidRankVotePair(rv)) {
      await createNewRVRound();
      return;
    }
    return;
  }
  await createNewRVRound();
}

async function claimRankVoteResolution(): Promise<boolean> {
  const db = getAdminDatabase();
  const resolvingRef = db.ref("rankvote/current/resolving");
  try {
    const result = await resolvingRef.transaction((cur) => {
      if (cur === true) return;
      return true;
    });
    return result.committed;
  } catch {
    return false;
  }
}

function rankVoteRoundId(fresh: Record<string, unknown>): string {
  const id = fresh.id;
  if (typeof id === "string" && id.length > 0) return id;
  const p1 = fresh.p1 as string;
  const p2 = fresh.p2 as string;
  const endTime = fresh.endTime as number;
  return `rv_legacy_${p1}_${p2}_${endTime}`;
}

async function writeRankVoteHistory(
  roundId: string,
  entry: Record<string, unknown>,
): Promise<void> {
  const db = getAdminDatabase();
  await db.ref(`rankvoteHistory/${roundId}`).set({ ...entry, id: roundId });
}

async function resolveRVIfNeededInternal(rv: Record<string, unknown>) {
  if (!rv) return;
  if (rv.resolved === true) {
    await createNewRVRound();
    return;
  }
  if ((rv.endTime as number) > Date.now()) return;

  if (!(await claimRankVoteResolution())) return;

  const db = getAdminDatabase();
  const freshSnap = await db.ref("rankvote/current").get();
  if (!freshSnap.exists()) {
    await createNewRVRound();
    return;
  }
  const fresh = freshSnap.val() as Record<string, unknown>;
  if (fresh.resolved === true) {
    await createNewRVRound();
    return;
  }
  if (!isValidRankVotePair(fresh)) {
    await createNewRVRound();
    return;
  }

  const roundId = rankVoteRoundId(fresh);
  const ovSnap = await db.ref("rankOverrides").get();
  const overrides = ovSnap.exists() ? (ovSnap.val() as Record<string, number>) : {};

  const p1 = fresh.p1 as string;
  const p2 = fresh.p2 as string;
  const votes = fresh.votes as Record<string, unknown> | undefined;
  const v1 = coerceVoteCount(votes?.[p1]);
  const v2 = coerceVoteCount(votes?.[p2]);
  const tsNow = Date.now();

  if (v1 === 0 && v2 === 0) {
    try {
      await Promise.all([
        writeRankVoteHistory(roundId, {
          winner: "empate",
          loser: "empate",
          wVotes: 0,
          lVotes: 0,
          ts: tsNow,
        }),
        db.ref("rankvote/current/resolved").set(true),
      ]);
    } catch (err) {
      console.warn("[server-rankvote] tie resolve partial fail:", err);
    } finally {
      await ensureActiveRVRoundOnServer();
    }
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
    try {
      await Promise.all([
        writeRankVoteHistory(roundId, {
          winner,
          loser,
          wVotes,
          lVotes,
          error: "not_found",
          ts: tsNow,
        }),
        db.ref("rankvote/current/resolved").set(true),
      ]);
    } catch (err) {
      console.warn("[server-rankvote] not_found resolve partial fail:", err);
    } finally {
      await ensureActiveRVRoundOnServer();
    }
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

  RANKERS.forEach((r) => {
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
    const [movSnap, upSnap, downSnap] = await Promise.all([
      db.ref("rankMovements").get(),
      db.ref("rankMovementsUp").get(),
      db.ref("rankMovementsDown").get(),
    ]);
    const movements = movSnap.exists()
      ? (movSnap.val() as Record<string, unknown>)
      : {};
    Object.assign(movements, movUpdates);
    batch.rankMovements = movements;

    let upStack = upSnap.exists() ? (upSnap.val() as MoverStack) : {};
    let downStack = downSnap.exists() ? (downSnap.val() as MoverStack) : {};

    if (winnerFinalIdx < winnerOrigIdx) {
      upStack = prependMoverStack(upStack, {
        name: winner,
        rank: winnerFinalIdx + 1,
        delta: winnerOrigIdx - winnerFinalIdx,
        ts: tsNow,
      });
    }
    if (loserFinalIdx > loserOrigIdx) {
      downStack = prependMoverStack(downStack, {
        name: loser,
        rank: loserFinalIdx + 1,
        delta: loserFinalIdx - loserOrigIdx,
        ts: tsNow,
      });
    }

    batch.rankMovementsUp = upStack;
    batch.rankMovementsDown = downStack;
  }

  try {
    await writeRankVoteHistory(roundId, {
      winner,
      loser,
      wVotes,
      lVotes,
      winnerPos: winnerOrigIdx + 1,
      loserPos: loserOrigIdx + 1,
      winnerNewPos: winnerFinalIdx + 1,
      loserNewPos: loserFinalIdx + 1,
      ts: tsNow,
    });
  } catch (err) {
    console.warn("[server-rankvote] rankvoteHistory write failed:", err);
  }

  try {
    await db.ref("/").update(batch);
    await db.ref("rankvote/current/resolved").set(true);
  } catch (err) {
    console.warn("[server-rankvote] ranking batch update failed:", err);
    try {
      await db.ref("rankvote/current/resolved").set(true);
    } catch {
      /* ignore */
    }
  } finally {
    await ensureActiveRVRoundOnServer();
  }
}

async function ensureRVExistsInternal() {
  const db = getAdminDatabase();
  const snap = await db.ref("rankvote/current").get();
  if (snap.exists()) {
    const rv = snap.val() as {
      p1: string;
      p2: string;
      resolved?: boolean;
      endTime: number;
      resolving?: boolean;
    };
    if (!isValidRankVotePair(rv)) {
      await createNewRVRound();
      return;
    }
    if (rv.resolved === true) {
      await createNewRVRound();
      return;
    }
    if (rv.endTime > Date.now()) return;
    if (rv.resolving === true) {
      await db.ref("rankvote/current/resolving").set(false);
    }
    await resolveRVIfNeededInternal(rv as Record<string, unknown>);
    const verify = await db.ref("rankvote/current").get();
    if (!verify.exists()) {
      await createNewRVRound();
      return;
    }
    const v = verify.val() as { resolved?: boolean };
    if (v.resolved === true) await createNewRVRound();
  } else {
    await createNewRVRound();
  }
}

export async function healRankvote(): Promise<{ healed: boolean }> {
  await enqueueHeal(ensureRVExistsInternal);
  return { healed: true };
}

export async function healRankvoteRound(rv: Record<string, unknown>): Promise<void> {
  await enqueueHeal(() => resolveRVIfNeededInternal(rv));
}

export { ensureRVExistsInternal as ensureRankvoteRound };
