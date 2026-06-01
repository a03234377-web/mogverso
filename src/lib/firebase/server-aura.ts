import {
  AURA_BOOST,
  AURA_PENALTY,
  AURA_RANKING_SIZE,
  AURA_VOTES_PER_WEEK,
} from "@/lib/aura/constants";
import { getMadridMonthId, getMadridWeekId } from "@/lib/aura/periods";
import { hashIpForVote } from "@/lib/security/client-ip";
import { getAdminDatabase } from "./admin";
import { getRankedNamesFromOverrides } from "./rank-overrides";
import type { AuraMeta, AuraVoteKind } from "@/types/aura";

export type AuraVoteResult =
  | { ok: true; votesRemaining: number; aura: number }
  | { ok: false; reason: string };

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
  const db = getAdminDatabase();
  const snap = await db.ref(`auraDeviceWeek/dev_${deviceId}_${weekId}`).get();
  if (!snap.exists()) return 0;
  const used = Number((snap.val() as { used?: number })?.used);
  return Number.isFinite(used) && used > 0 ? used : 0;
}

export async function castAuraVoteServer(
  name: string,
  kind: AuraVoteKind,
  deviceId: string,
  ip: string,
): Promise<AuraVoteResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "invalid_candidate" };

  const meta = await ensureAuraPeriods();
  const { weekId } = meta;

  if (!(await isEligibleAuraName(trimmed))) {
    return { ok: false, reason: "invalid_candidate" };
  }

  const db = getAdminDatabase();
  const ipHash = hashIpForVote(ip);
  const devKey = `auraDeviceWeek/dev_${deviceId}_${weekId}`;
  const ipKey = `auraIpWeek/ip_${ipHash}_${weekId}`;

  const [devSnap, ipSnap] = await Promise.all([
    db.ref(devKey).get(),
    db.ref(ipKey).get(),
  ]);

  const devUsed = Number((devSnap.val() as { used?: number })?.used) || 0;
  const ipUsed = Number((ipSnap.val() as { used?: number })?.used) || 0;
  const used = Math.max(devUsed, ipUsed);

  if (used >= AURA_VOTES_PER_WEEK) {
    return { ok: false, reason: "aura_votes_exhausted" };
  }

  const delta = deltaForKind(kind);
  const scorePath = `aura/scores/${trimmed}`;

  try {
    const scoreResult = await db.ref(scorePath).transaction((cur) => {
      const base = typeof cur === "number" && Number.isFinite(cur) ? cur : 0;
      return base + delta;
    });

    if (!scoreResult.committed) {
      return { ok: false, reason: "transaction_failed" };
    }

    const aura =
      typeof scoreResult.snapshot.val() === "number"
        ? scoreResult.snapshot.val()
        : delta;

    const nextUsed = used + 1;
    const ts = Date.now();
    await db.ref("/").update({
      [devKey]: { used: nextUsed, ts, name: trimmed, kind, delta },
      [ipKey]: { used: nextUsed, ts, name: trimmed, kind, delta },
    });

    return {
      ok: true,
      votesRemaining: Math.max(0, AURA_VOTES_PER_WEEK - nextUsed),
      aura,
    };
  } catch {
    return { ok: false, reason: "transaction_failed" };
  }
}
