"use client";

import { submitAuraVote } from "@/features/aura/actions";
import { healEntryVoteAction, submitEntryVote } from "@/features/rankings/actions";
import { healRankvoteAction, submitRankVote } from "@/features/rankvote/actions";
import {
  fetchTorneoMyVotesAction,
  healTorneoAction,
  submitTorneoVote,
} from "@/features/torneo/actions";
import type { AuraVoteKind } from "@/types/aura";
import type { ActionResult } from "@/lib/firebase/perform";
import {
  HEAL_TORNEO_COOLDOWN_MS,
  HEAL_TORNEO_RATE_LIMIT_BACKOFF_MS,
} from "@/lib/vote-intervals";
import { getDeviceId } from "./device-id";

export type HealResponse = ActionResult;
export type VoteApiResponse = ActionResult;

let healTorneoInFlight: Promise<HealResponse> | null = null;
let healTorneoNextAllowedAt = 0;

export async function healTorneoApi(options?: {
  restartIfEnded?: boolean;
  force?: boolean;
}): Promise<HealResponse> {
  const now = Date.now();
  const force = options?.force === true;

  if (healTorneoInFlight) {
    return healTorneoInFlight;
  }

  if (!force && now < healTorneoNextAllowedAt) {
    return { ok: true, healed: false };
  }

  healTorneoInFlight = (async () => {
    if (!force) {
      healTorneoNextAllowedAt = Date.now() + HEAL_TORNEO_COOLDOWN_MS;
    }

    const actionResult = await healTorneoAction(options);
    if (!actionResult.ok && actionResult.reason === "rate_limit") {
      healTorneoNextAllowedAt = Date.now() + HEAL_TORNEO_RATE_LIMIT_BACKOFF_MS;
    }
    return actionResult;
  })();

  try {
    return await healTorneoInFlight;
  } finally {
    healTorneoInFlight = null;
  }
}

export async function healRankvoteApi(): Promise<HealResponse> {
  return healRankvoteAction();
}

export async function healEntryVoteApi(): Promise<HealResponse> {
  return healEntryVoteAction();
}

export async function voteRankvoteApi(
  name: string,
  recaptchaToken?: string,
): Promise<VoteApiResponse> {
  return submitRankVote(name, getDeviceId(), recaptchaToken);
}

export async function voteEntryApi(
  candidateId: string,
  recaptchaToken?: string,
): Promise<VoteApiResponse> {
  return submitEntryVote(candidateId, getDeviceId(), recaptchaToken);
}

export async function voteTorneoApi(
  matchId: string,
  candidateName: string,
  recaptchaToken?: string,
): Promise<VoteApiResponse> {
  try {
    const res = await fetch("/api/vote/torneo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        candidateName,
        deviceId: getDeviceId(),
        recaptchaToken,
      }),
    });
    const data = (await res.json()) as VoteApiResponse & {
      reason?: string;
      error?: string;
    };
    if (res.ok && data.ok) return data;
    const reason = data.reason ?? data.error ?? "vote_failed";
    return { ok: false, reason, error: reason };
  } catch (err) {
    console.warn("[voteTorneoApi] fetch failed, trying server action:", err);
  }
  return submitTorneoVote(matchId, candidateName, getDeviceId(), recaptchaToken);
}

export async function fetchTorneoMyVotesApi(
  editionStartMs: number,
): Promise<Record<string, string>> {
  try {
    const res = await fetch("/api/vote/torneo/my-votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        editionStartMs,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      votes?: Record<string, string>;
    };
    if (res.ok && data.ok && data.votes) return data.votes;
  } catch {
    /* fetch puede fallar (offline, bloqueador); probamos server action */
  }

  try {
    const result = await fetchTorneoMyVotesAction(getDeviceId(), editionStartMs);
    if (result.ok && result.votes) return result.votes;
  } catch {
    /* sin admin en local: localStorage sigue siendo fallback */
  }

  return {};
}

export async function voteAuraApi(
  name: string,
  kind: AuraVoteKind,
  recaptchaToken?: string,
): Promise<
  VoteApiResponse & {
    votesRemaining?: number;
    aura?: number;
    delta?: number;
    weekId?: string;
    votedNames?: string[];
  }
> {
  try {
    const res = await fetch("/api/vote/aura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        kind,
        deviceId: getDeviceId(),
        recaptchaToken,
      }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      reason?: string;
      votesRemaining?: number;
      aura?: number;
      delta?: number;
      weekId?: string;
      votedNames?: string[];
    };

    if (!res.ok || !data.ok) {
      const reason = data.error ?? data.reason ?? "vote_failed";
      return { ok: false, reason, error: reason };
    }

    return {
      ok: true,
      votesRemaining: data.votesRemaining,
      aura: data.aura,
      delta: data.delta,
      weekId: data.weekId,
      votedNames: data.votedNames,
    };
  } catch (err) {
    console.error("[voteAuraApi] fetch failed, trying server action:", err);
    return submitAuraVote(name, kind, getDeviceId(), recaptchaToken);
  }
}
