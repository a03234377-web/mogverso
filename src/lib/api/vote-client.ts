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
import { getDeviceId } from "./device-id";

export type HealResponse = ActionResult;
export type VoteApiResponse = ActionResult;

export async function healRankvoteApi(): Promise<HealResponse> {
  return healRankvoteAction();
}

export async function healEntryVoteApi(): Promise<HealResponse> {
  return healEntryVoteAction();
}

export async function healTorneoApi(options?: {
  restartIfEnded?: boolean;
}): Promise<HealResponse> {
  try {
    const res = await fetch("/api/heal/torneo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restartIfEnded: options?.restartIfEnded === true,
      }),
    });
    const data = (await res.json()) as HealResponse & { healed?: boolean };
    if (res.ok && data.ok) return data;
    if (res.status === 429) {
      return { ok: false, reason: "rate_limit", error: "rate_limit" };
    }
  } catch (err) {
    console.warn("[healTorneoApi] fetch failed, trying server action:", err);
  }
  return healTorneoAction(options);
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
