import { healTorneoApi } from "@/lib/api/vote-client";
import type { FirebaseBridge } from "@/lib/firebase/client";
import {
  getEditionStartMsForWeekContaining,
  getTorneoVotingCanonicalEndMs,
  getTorneoVotingTargetMs,
  getUpcomingTorneoStartMs,
  isTorneoLegacyBreakReadyToOpen,
  isTorneoPhaseExpired,
} from "@/lib/torneo-schedule";
import type { TorneoState } from "@/types/looksmax";
import { PHASES } from "./torneo-players";

async function readTorneoState(fb: FirebaseBridge): Promise<TorneoState | null> {
  const snap = await fb.get(fb.ref(fb.db, "torneo/state"));
  return snap.exists() ? (snap.val() as TorneoState) : null;
}

/** Asegura estado torneo vía heal server-side solo cuando hace falta. */
export async function ensureTorneoState(
  fb: FirebaseBridge,
  now = Date.now(),
): Promise<TorneoState> {
  let existing = await readTorneoState(fb);
  if (!existing) {
    await healTorneoApi();
    existing = await readTorneoState(fb);
    if (!existing) {
      throw new Error("Torneo state unavailable after heal");
    }
    return existing;
  }

  const editionStart = getEditionStartMsForWeekContaining(now);
  const waitingNeedsHeal =
    existing.phase === PHASES.WAITING_OCTAVOS &&
    (now >= editionStart ||
      Math.abs(existing.phaseEnd - getUpcomingTorneoStartMs(now)) > 60_000);
  const votingStaleTarget =
    getTorneoVotingCanonicalEndMs(existing, now) != null &&
    Math.abs(existing.phaseEnd - getTorneoVotingTargetMs(existing, now)) > 60_000;

  const legacyBreakNeedsOpen =
    (existing.phase === PHASES.BREAK_CUARTOS ||
      existing.phase === PHASES.SEMIFINALS_PROMO) &&
    isTorneoLegacyBreakReadyToOpen(existing, now);

  if (
    waitingNeedsHeal ||
    votingStaleTarget ||
    legacyBreakNeedsOpen ||
    isTorneoPhaseExpired(existing, now)
  ) {
    await healTorneoApi();
    const refreshed = await readTorneoState(fb);
    return refreshed ?? existing;
  }

  return existing;
}

export async function advanceTorneoPhaseIfNeeded(
  fb: FirebaseBridge,
  state: TorneoState | null | undefined,
  now = Date.now(),
): Promise<TorneoState | null | undefined> {
  if (!state) return state;
  if (!isTorneoPhaseExpired(state, now)) return state;

  await healTorneoApi();
  return readTorneoState(fb);
}
