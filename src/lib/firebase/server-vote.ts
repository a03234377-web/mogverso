import { coerceVoteCount } from "@/lib/coerce-vote-count";
import { hashIpForVote } from "@/lib/security/client-ip";
import { getAdminDatabase } from "./admin";
import { healRankvoteRound, ensureRankvoteRound } from "./server-rankvote";
import {
  isValidEntryVoteCandidate,
  resolveTorneoVotePath,
  validateRankVoteCandidate,
} from "./validate-vote";

export type VoteResult = { ok: true; rv?: unknown } | { ok: false; reason: string };

export async function castRankvoteServer(
  name: string,
  deviceId: string,
  ip: string,
): Promise<VoteResult> {
  await ensureRankvoteRound();

  const db = getAdminDatabase();
  const snap = await db.ref("rankvote/current").get();
  if (!snap.exists()) return { ok: false, reason: "no_round" };

  const rv = snap.val() as {
    id: string;
    resolved?: boolean;
    endTime: number;
    p1: string;
    p2: string;
  };

  if (rv.resolved) return { ok: false, reason: "resolved" };
  if (rv.endTime <= Date.now()) {
    await healRankvoteRound(rv as Record<string, unknown>);
    return { ok: false, reason: "expired" };
  }
  if (!validateRankVoteCandidate(rv, name)) {
    return { ok: false, reason: "invalid_candidate" };
  }

  const ipHash = hashIpForVote(ip);
  const [devSnap, ipSnap] = await Promise.all([
    db.ref(`rankvoteVotes/dev_${deviceId}_${rv.id}`).get(),
    db.ref(`rankvoteVotes/ip_${ipHash}_${rv.id}`).get(),
  ]);

  if (devSnap.exists() || ipSnap.exists()) {
    return { ok: false, reason: "already_voted" };
  }

  try {
    await db.ref(`rankvote/current/votes/${name}`).transaction((cur) => {
      return coerceVoteCount(cur) + 1;
    });

    const ts = Date.now();
    await db.ref("/").update({
      [`rankvoteVotes/dev_${deviceId}_${rv.id}`]: { candidate: name, ts },
      [`rankvoteVotes/ip_${ipHash}_${rv.id}`]: { candidate: name, ts },
    });

    return { ok: true, rv };
  } catch {
    return { ok: false, reason: "transaction_failed" };
  }
}

export async function castEntryVoteServer(
  candidateId: string,
  deviceId: string,
  ip: string,
): Promise<VoteResult> {
  if (!isValidEntryVoteCandidate(candidateId)) {
    return { ok: false, reason: "invalid_candidate" };
  }

  const db = getAdminDatabase();
  const evSnap = await db.ref("entryVote/current").get();
  if (!evSnap.exists()) return { ok: false, reason: "no_round" };

  const ev = evSnap.val() as {
    id: string;
    winner?: string;
    endTime: number;
  };
  if (ev.winner) return { ok: false, reason: "resolved" };
  if (ev.endTime <= Date.now()) return { ok: false, reason: "expired" };

  const ipHash = hashIpForVote(ip);
  const [devSnap, ipSnap] = await Promise.all([
    db.ref(`entryVotes/dev_${deviceId}_${ev.id}`).get(),
    db.ref(`entryVotes/ip_${ipHash}_${ev.id}`).get(),
  ]);

  if (devSnap.exists() || ipSnap.exists()) {
    return { ok: false, reason: "already_voted" };
  }

  try {
    await db.ref(`entryVote/current/votes/${candidateId}`).transaction((cur) => {
      return (cur || 0) + 1;
    });

    const ts = Date.now();
    await db.ref("/").update({
      [`entryVotes/dev_${deviceId}_${ev.id}`]: { candidate: candidateId, ts },
      [`entryVotes/ip_${ipHash}_${ev.id}`]: { candidate: candidateId, ts },
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: "transaction_failed" };
  }
}

export async function castTorneoVoteServer(
  matchId: string,
  candidateName: string,
  deviceId: string,
  ip: string,
): Promise<VoteResult> {
  const db = getAdminDatabase();
  const stateSnapPre = await db.ref("torneo/state").get();
  const torneoCreatedAt = stateSnapPre.exists()
    ? ((stateSnapPre.val() as { createdAt?: number }).createdAt ?? 0)
    : 0;

  const [devSnap, ipSnapPre] = await Promise.all([
    db.ref(`torneoVotes/dev_${deviceId}_${matchId}`).get(),
    db.ref(`torneoVotes/ip_${hashIpForVote(ip)}_${matchId}`).get(),
  ]);

  if (devSnap.exists() || ipSnapPre.exists()) {
    return { ok: false, reason: "already_voted" };
  }

  const stateSnap = await db.ref("torneo/state").get();
  if (!stateSnap.exists()) return { ok: false, reason: "no_state" };

  const st = stateSnap.val() as Record<string, unknown>;
  const resolved = resolveTorneoVotePath(st, matchId, candidateName);
  if (!resolved.ok) return { ok: false, reason: resolved.reason };

  const ipHash = hashIpForVote(ip);

  try {
    await db.ref(resolved.votePath).transaction((cur) => (cur || 0) + 1);
    const ts = Date.now();
    await db.ref("/").update({
      [`torneoVotes/dev_${deviceId}_${matchId}`]: { candidate: candidateName, ts },
      [`torneoVotes/ip_${ipHash}_${matchId}`]: { candidate: candidateName, ts },
    });
    void torneoCreatedAt;
    return { ok: true };
  } catch {
    return { ok: false, reason: "transaction_failed" };
  }
}
