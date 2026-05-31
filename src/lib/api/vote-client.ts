"use client";

import { healEntryVoteAction, submitEntryVote } from "@/features/rankings/actions";
import { healRankvoteAction, submitRankVote } from "@/features/rankvote/actions";
import { healTorneoAction, submitTorneoVote } from "@/features/torneo/actions";
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
  return submitTorneoVote(matchId, candidateName, getDeviceId(), recaptchaToken);
}
