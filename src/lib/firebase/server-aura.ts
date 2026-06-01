import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import {
  AURA_BOOST,
  AURA_PENALTY,
  AURA_RANKING_SIZE,
  AURA_VOTES_PER_WEEK,
} from "@/lib/aura/constants";
import {
  auraDeviceWeekLegacyPath,
  auraDeviceWeekPath,
  auraIpWeekPath,
} from "@/lib/aura/device-week-path";
import { coerceAuraScore, parseAuraScores } from "@/lib/aura/coerce-score";
import { auraScoreKey } from "@/lib/aura/firebase-keys";
import { ballotVotedNames } from "@/lib/aura/week-ballot";
import { getMadridMonthId, getMadridWeekId } from "@/lib/aura/periods";
import {
  hasAuraVoteFor,
  mergeAuraWeekBallots,
  parseAuraWeekBallot,
  type AuraWeekBallot,
} from "@/lib/aura/week-ballot";
import { hashIpForVote } from "@/lib/security/client-ip";
import { getAdminDatabase } from "./admin";
import { getRankedNamesFromOverrides } from "./rank-overrides";
import type { AuraMeta, AuraVoteKind } from "@/types/aura";

export type AuraVoteResult =
  | {
      ok: true;
      votesRemaining: number;
      aura: number;
      delta: number;
      weekId: string;
      votedNames: string[];
    }
  | { ok: false; reason: string };

/** Lee papeleta (ruta canónica + legacy por compatibilidad). */
export async function readAuraDeviceWeekBallot(
  deviceId: string,
  weekId: string,
): Promise<AuraWeekBallot> {
  const db = getAdminDatabase();
  const primaryPath = auraDeviceWeekPath(deviceId, weekId);
  const legacyPath = auraDeviceWeekLegacyPath(deviceId, weekId);

  const [primarySnap, legacySnap] = await Promise.all([
    db.ref(primaryPath).get(),
    db.ref(legacyPath).get(),
  ]);

  const primary = parseAuraWeekBallot(primarySnap.val());
  const legacy = parseAuraWeekBallot(legacySnap.val());
  const merged = mergeAuraWeekBallots(primary, legacy);

  const primaryEmpty = Object.keys(primary.byName).length === 0;
  const hasVotes = Object.keys(merged.byName).length > 0;

  if (primaryEmpty && hasVotes) {
    await db.ref(primaryPath).set(merged);
  }

  return merged;
}

/** Reescribe puntuaciones como enteros (corrige strings legacy en RTDB). */
export async function normalizeAuraScoresInDb(): Promise<number> {
  const db = getAdminDatabase();
  const snap = await db.ref("aura/scores").get();
  if (!snap.exists()) return 0;

  const parsed = parseAuraScores(snap.val());
  const normalized: Record<string, number> = { ...parsed };
  let fixed = 0;

  for (const [key, value] of Object.entries(snap.val() as Record<string, unknown>)) {
    const canonical = resolveCanonicalRankerName(key);
    if (canonical !== key.trim()) fixed += 1;
    if (coerceAuraScore(value) !== parsed[canonical]) fixed += 1;
  }

  await db.ref("aura/scores").set(normalized);
  return fixed;
}

export async function ensureAuraPeriods(): Promise<AuraMeta> {
  const db = getAdminDatabase();
  const weekId = getMadridWeekId();
  const monthId = getMadridMonthId();
  const snap = await db.ref("aura/meta").get();
  const meta = (snap.val() ?? {}) as Partial<AuraMeta>;

  const updates: Record<string, unknown> = {};

  if (meta.monthId !== monthId) {
    updates["aura/scores"] = {};
    updates["aura/meta"] = { weekId, monthId };
    await db.ref("/").update(updates);
    return { weekId, monthId };
  }

  if (meta.weekId !== weekId || !meta.monthId) {
    await db.ref("aura/meta").set({ weekId, monthId });
  }

  // Cupo semanal: claves auraDeviceWeek/*_${weekId} — semana nueva = papeleta vacía = 10 votos.
  return { weekId, monthId };
}

function deltaForKind(kind: AuraVoteKind): number {
  return kind === "boost" ? AURA_BOOST : -AURA_PENALTY;
}

async function isEligibleAuraName(name: string): Promise<boolean> {
  const db = getAdminDatabase();
  const overridesSnap = await db.ref("rankOverrides").get();
  const overrides = overridesSnap.exists()
    ? (overridesSnap.val() as Record<string, number>)
    : {};
  const ranked = getRankedNamesFromOverrides(overrides);
  const idx = ranked.indexOf(name);
  return idx >= 0 && idx < AURA_RANKING_SIZE;
}

export async function getAuraVotesUsed(
  deviceId: string,
  weekId: string,
): Promise<number> {
  return (await readAuraDeviceWeekBallot(deviceId, weekId)).used;
}

export async function castAuraVoteServer(
  name: string,
  kind: AuraVoteKind,
  deviceId: string,
  ip: string,
): Promise<AuraVoteResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "invalid_candidate" };

  const canonical = resolveCanonicalRankerName(trimmed);

  const meta = await ensureAuraPeriods();
  const weekId = meta.weekId || getMadridWeekId();

  if (!(await isEligibleAuraName(canonical))) {
    return { ok: false, reason: "invalid_candidate" };
  }

  const db = getAdminDatabase();
  const ipHash = hashIpForVote(ip);
  const devPath = auraDeviceWeekPath(deviceId, weekId);
  const ipPath = auraIpWeekPath(ipHash, weekId);

  const [deviceBallot, ipSnap] = await Promise.all([
    readAuraDeviceWeekBallot(deviceId, weekId),
    db.ref(ipPath).get(),
  ]);

  const ballot = mergeAuraWeekBallots(
    deviceBallot,
    parseAuraWeekBallot(ipSnap.val()),
  );

  if (hasAuraVoteFor(ballot, canonical)) {
    return { ok: false, reason: "aura_already_voted_candidate" };
  }

  if (ballot.used >= AURA_VOTES_PER_WEEK) {
    return { ok: false, reason: "aura_votes_exhausted" };
  }

  const delta = deltaForKind(kind);
  const scoreRef = db.ref("aura/scores").child(auraScoreKey(canonical));
  const ts = Date.now();
  const nextBallot: AuraWeekBallot = {
    byName: {
      ...ballot.byName,
      [canonical]: { kind, ts, delta },
    },
    used: 0,
  };
  nextBallot.used = Object.keys(nextBallot.byName).length;

  const previousDeviceBallot = deviceBallot;
  const previousIpBallot = parseAuraWeekBallot(ipSnap.val());

  try {
    await Promise.all([
      db.ref(devPath).set(nextBallot),
      db.ref(ipPath).set(nextBallot),
    ]);

    const verified = await readAuraDeviceWeekBallot(deviceId, weekId);
    if (!hasAuraVoteFor(verified, canonical)) {
      console.error("[aura] ballot verify failed after write", { devPath, weekId });
      return { ok: false, reason: "transaction_failed" };
    }

    const scoreResult = await scoreRef.transaction((cur) => {
      const next = coerceAuraScore(cur) + delta;
      return Number(next);
    });

    if (!scoreResult.committed) {
      await Promise.all([
        db.ref(devPath).set(previousDeviceBallot),
        db.ref(ipPath).set(previousIpBallot),
      ]);
      return { ok: false, reason: "transaction_failed" };
    }

    const aura = coerceAuraScore(scoreResult.snapshot.val());

    return {
      ok: true,
      votesRemaining: Math.max(0, AURA_VOTES_PER_WEEK - nextBallot.used),
      aura,
      delta,
      weekId,
      votedNames: ballotVotedNames(nextBallot),
    };
  } catch (err) {
    console.error("[aura] castAuraVoteServer:", err);
    try {
      await Promise.all([
        db.ref(devPath).set(previousDeviceBallot),
        db.ref(ipPath).set(previousIpBallot),
      ]);
    } catch (rollbackErr) {
      console.error("[aura] ballot rollback failed:", rollbackErr);
    }
    return { ok: false, reason: "transaction_failed" };
  }
}
