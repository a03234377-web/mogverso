import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyRecaptchaToken } from "@/lib/security/recaptcha";
import { isAdminConfigured } from "./admin";
import { healEntryVote } from "./server-entry-vote";
import { healRankvote } from "./server-rankvote";
import { healTorneo } from "./server-torneo";
import { castAuraVoteServer } from "./server-aura";
import {
  castEntryVoteServer,
  castRankvoteServer,
  castTorneoVoteServer,
  type VoteResult,
} from "./server-vote";
import type { AuraResetResult } from "@/lib/firebase/server-aura";
import type { AuraVoteKind } from "@/types/aura";
import { isValidEntryVoteCandidate } from "./validate-vote";

export type ActionResult =
  | { ok: true; rv?: unknown; healed?: boolean }
  | { ok: false; reason?: string; error?: string };

function notConfigured(): ActionResult {
  return { ok: false, reason: "server_not_configured", error: "server_not_configured" };
}

export async function performRankvoteVote(
  name: string,
  deviceId: string,
  ip: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("vote-rankvote", ip, 10, 3600);
  if (!rl.allowed) return { ok: false, reason: "rate_limit", error: "rate_limit" };

  const captcha = await verifyRecaptchaToken(recaptchaToken, ip);
  if (!captcha.ok) return { ok: false, reason: captcha.reason, error: captcha.reason };

  const result = await castRankvoteServer(name.trim(), deviceId, ip);
  if (!result.ok) return { ok: false, reason: result.reason, error: result.reason };
  return { ok: true, rv: result.rv };
}

export async function performEntryVote(
  candidateId: string,
  deviceId: string,
  ip: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();

  if (!isValidEntryVoteCandidate(candidateId)) {
    return { ok: false, reason: "invalid_candidate", error: "invalid_candidate" };
  }

  const rl = await checkRateLimit("vote-entry", ip, 10, 3600);
  if (!rl.allowed) return { ok: false, reason: "rate_limit", error: "rate_limit" };

  const captcha = await verifyRecaptchaToken(recaptchaToken, ip);
  if (!captcha.ok) return { ok: false, reason: captcha.reason, error: captcha.reason };

  const result = await castEntryVoteServer(candidateId, deviceId, ip);
  if (!result.ok) return { ok: false, reason: result.reason, error: result.reason };
  return { ok: true };
}

export async function performAuraVote(
  name: string,
  kind: AuraVoteKind,
  deviceId: string,
  ip: string,
  recaptchaToken?: string,
): Promise<
  ActionResult & {
    votesRemaining?: number;
    aura?: number;
    delta?: number;
    weekId?: string;
    votedNames?: string[];
  }
> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("vote-aura", ip, 20, 3600);
  if (!rl.allowed) return { ok: false, reason: "rate_limit", error: "rate_limit" };

  const captcha = await verifyRecaptchaToken(recaptchaToken, ip);
  if (!captcha.ok) return { ok: false, reason: captcha.reason, error: captcha.reason };

  const result = await castAuraVoteServer(name, kind, deviceId, ip);
  if (!result.ok) return { ok: false, reason: result.reason, error: result.reason };
  return {
    ok: true,
    votesRemaining: result.votesRemaining,
    aura: result.aura,
    delta: result.delta,
    weekId: result.weekId,
    votedNames: result.votedNames,
  };
}

export async function performResetAuraVotes(
  ip: string,
  options?: { clearScores?: boolean; clearBallots?: boolean },
): Promise<ActionResult | ({ ok: true } & AuraResetResult)> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("reset-aura", ip, 6, 60);
  if (!rl.allowed) return { ok: false, error: "rate_limit", reason: "rate_limit" };

  const { resetAuraVotesServer } = await import("./server-aura");
  const result = await resetAuraVotesServer(options);
  return { ok: true, ...result };
}

export async function performHealAura(ip: string): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("heal-aura", ip, 12, 60);
  if (!rl.allowed) return { ok: false, error: "rate_limit", reason: "rate_limit" };

  const { ensureAuraPeriods, normalizeAuraScoresInDb } = await import("./server-aura");
  await ensureAuraPeriods();
  await normalizeAuraScoresInDb();
  return { ok: true, healed: true };
}

export async function performTorneoVote(
  matchId: string,
  candidateName: string,
  deviceId: string,
  ip: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("vote-torneo", ip, 10, 3600);
  if (!rl.allowed) return { ok: false, reason: "rate_limit", error: "rate_limit" };

  const captcha = await verifyRecaptchaToken(recaptchaToken, ip);
  if (!captcha.ok) return { ok: false, reason: captcha.reason, error: captcha.reason };

  const result = await castTorneoVoteServer(matchId, candidateName, deviceId, ip);
  if (!result.ok) return { ok: false, reason: result.reason, error: result.reason };
  return { ok: true };
}

export async function performHealRankvote(ip: string): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("heal-rankvote", ip, 6, 60);
  if (!rl.allowed) return { ok: false, error: "rate_limit", reason: "rate_limit" };

  const result = await healRankvote();
  return { ok: true, healed: result.healed };
}

export async function performHealEntryVote(ip: string): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("heal-entry", ip, 6, 60);
  if (!rl.allowed) return { ok: false, error: "rate_limit", reason: "rate_limit" };

  const result = await healEntryVote();
  return { ok: true, healed: result.healed };
}

export async function performHealTorneo(
  ip: string,
  options?: { restartIfEnded?: boolean },
): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();

  const rl = await checkRateLimit("heal-torneo", ip, 30, 60);
  if (!rl.allowed) return { ok: false, error: "rate_limit", reason: "rate_limit" };

  const result = await healTorneo(options);
  return { ok: true, healed: result.healed };
}

/** Cron: sin rate limit por IP de visitante. */
export async function performCronHealRankvote(): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();
  const result = await healRankvote();
  return { ok: true, healed: result.healed };
}

export async function performCronHealEntryVote(): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();
  const result = await healEntryVote();
  return { ok: true, healed: result.healed };
}

export async function performCronHealTorneo(): Promise<ActionResult> {
  if (!isAdminConfigured()) return notConfigured();
  const result = await healTorneo();
  return { ok: true, healed: result.healed };
}

export type { VoteResult };
