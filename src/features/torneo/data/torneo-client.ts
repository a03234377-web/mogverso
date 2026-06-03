import { healTorneoApi } from "@/lib/api/vote-client";
import type { FirebaseBridge } from "@/lib/firebase/client";
import {
  getEditionStartMsForWeekContaining,
  getUpcomingTorneoStartMs,
} from "@/lib/torneo-schedule";
import type { TorneoState } from "@/types/looksmax";
import { PHASES } from "./torneo-players";

async function readTorneoState(fb: FirebaseBridge): Promise<TorneoState | null> {
  const snap = await fb.get(fb.ref(fb.db, "torneo/state"));
  return snap.exists() ? (snap.val() as TorneoState) : null;
}

/** Asegura estado torneo vía heal server-side y devuelve lectura RTDB. */
export async function ensureTorneoState(
  fb: FirebaseBridge,
  now = Date.now(),
): Promise<TorneoState> {
  await healTorneoApi();

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

  if (waitingNeedsHeal || existing.phaseEnd <= now - 2000) {
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
  if (state.phaseEnd > now - 2000) return state;

  await healTorneoApi();
  return readTorneoState(fb);
}
