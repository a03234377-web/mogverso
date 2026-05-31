import { healTorneoApi } from "@/lib/api/vote-client";
import type { FirebaseBridge } from "@/lib/firebase/client";
import type { TorneoState } from "@/types/looksmax";
import { PHASES } from "./torneo-players";

export async function readTorneoState(fb: FirebaseBridge): Promise<TorneoState | null> {
  const snap = await fb.get(fb.ref(fb.db, "torneo/state"));
  return snap.exists() ? (snap.val() as TorneoState) : null;
}

/** Asegura estado torneo vía heal server-side y devuelve lectura RTDB. */
export async function ensureTorneoState(
  fb: FirebaseBridge,
  now = Date.now(),
): Promise<TorneoState> {
  await healTorneoApi();

  const existing = await readTorneoState(fb);
  if (existing) {
    if (existing.phase === PHASES.WAITING_OCTAVOS && existing.phaseEnd > now) {
      return existing;
    }
    if (existing.phaseEnd <= now - 2000) {
      await healTorneoApi();
      const advanced = await readTorneoState(fb);
      return advanced ?? existing;
    }
    return existing;
  }

  await healTorneoApi();
  const created = await readTorneoState(fb);
  if (!created) {
    throw new Error("Torneo state unavailable after heal");
  }
  return created;
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
