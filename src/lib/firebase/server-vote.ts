import { PHASES } from "@/features/torneo/data/torneo-players";
import { getEditionStartMsForWeekContaining } from "@/lib/torneo-schedule";
import { torneoVoteDeviceKey, torneoVoteIpKey } from "@/lib/torneo-vote-keys";
import { coerceVoteCount } from "@/lib/coerce-vote-count";
import { hashIpForVote } from "@/lib/security/client-ip";
import { getAdminDatabase } from "./admin";
import { healRankvoteRound, ensureRankvoteRound } from "./server-rankvote";
import { ensureTorneoOctavosStarted } from "./server-torneo";
import {
  isValidEntryVoteCandidate,
  resolveTorneoVotePath,
  validateTorneoVoteContext,
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

export async function getTorneoVotesForDevice(
  deviceId: string,
  editionStartMs: number,
): Promise<Record<string, string>> {
  const db = getAdminDatabase();
  const snap = await db.ref("torneoVotes").get();
  if (!snap.exists()) return {};

  const scopedPrefix = `dev_${deviceId}_${editionStartMs}_`;
  const legacyPrefix = `dev_${deviceId}_`;
  const out: Record<string, string> = {};
  const val = snap.val() as Record<string, { candidate?: string }>;

  for (const [key, data] of Object.entries(val)) {
    const candidate = data?.candidate;
    if (!candidate) continue;

    if (key.startsWith(scopedPrefix)) {
      out[key.slice(scopedPrefix.length)] = candidate;
      continue;
    }

    if (!key.startsWith(legacyPrefix)) continue;
    const rest = key.slice(legacyPrefix.length);
    if (/^\d+_/.test(rest)) continue;
    out[rest] ??= candidate;
  }

  return out;
}

export async function castTorneoVoteServer(
  matchId: string,
  candidateName: string,
  deviceId: string,
  ip: string,
): Promise<VoteResult> {
  const db = getAdminDatabase();
  const now = Date.now();
  let stateSnap = await db.ref("torneo/state").get();
  if (!stateSnap.exists()) return { ok: false, reason: "no_state" };

  let st = stateSnap.val() as Record<string, unknown>;
  if (st.phase === PHASES.WAITING_OCTAVOS) {
    const editionStart = getEditionStartMsForWeekContaining(now);
    if (now >= editionStart) {
      const fresh = await ensureTorneoOctavosStarted(now);
      if (fresh) {
        st = fresh as unknown as Record<string, unknown>;
      } else {
        stateSnap = await db.ref("torneo/state").get();
        if (stateSnap.exists()) st = stateSnap.val() as Record<string, unknown>;
      }
    }
  }

  const voteEditionStartMs =
    typeof st.editionStartMs === "number"
      ? st.editionStartMs
      : getEditionStartMsForWeekContaining(now);
  const voteDevKey = torneoVoteDeviceKey(deviceId, voteEditionStartMs, matchId);
  const voteIpKey = torneoVoteIpKey(hashIpForVote(ip), voteEditionStartMs, matchId);

  const [devSnap, ipSnapPre, legacyDevSnap, legacyIpSnap] = await Promise.all([
    db.ref(`torneoVotes/${voteDevKey}`).get(),
    db.ref(`torneoVotes/${voteIpKey}`).get(),
    db.ref(`torneoVotes/dev_${deviceId}_${matchId}`).get(),
    db.ref(`torneoVotes/ip_${hashIpForVote(ip)}_${matchId}`).get(),
  ]);

  if (
    devSnap.exists() ||
    ipSnapPre.exists() ||
    legacyDevSnap.exists() ||
    legacyIpSnap.exists()
  ) {
    return { ok: false, reason: "already_voted" };
  }

  const phaseCheck = validateTorneoVoteContext(st, matchId, now);
  if (!phaseCheck.ok) return { ok: false, reason: phaseCheck.reason };

  const resolved = resolveTorneoVotePath(st, matchId, candidateName);
  if (!resolved.ok) return { ok: false, reason: resolved.reason };

  try {
    await db.ref(resolved.votePath).transaction((cur) => (cur || 0) + 1);
    const ts = Date.now();
    await db.ref("/").update({
      [`torneoVotes/${voteDevKey}`]: { candidate: candidateName, ts },
      [`torneoVotes/${voteIpKey}`]: { candidate: candidateName, ts },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "transaction_failed" };
  }
}
