import { ENTRY_VOTE_MS } from "@/lib/vote-intervals";
import { getAdminDatabase } from "./admin";

async function createEntryVote() {
  const db = getAdminDatabase();
  const newEV = {
    id: "ev_" + Date.now(),
    votes: { franbv: 0, nilojeda: 0 },
    endTime: Date.now() + ENTRY_VOTE_MS,
    winner: null,
  };
  await db.ref("entryVote/current").set(newEV);
  return newEV;
}

async function resolveEntryVoteInDB(ev: Record<string, unknown>) {
  if (ev.winner) return;
  if ((ev.endTime as number) > Date.now()) return;
  const votes = ev.votes as Record<string, number> | undefined;
  const v1 = votes?.franbv || 0;
  const v2 = votes?.nilojeda || 0;
  if (v1 + v2 === 0) return;
  const winnerId = v1 >= v2 ? "franbv" : "nilojeda";
  const db = getAdminDatabase();
  await db.ref("entryVote/current").update({
    winner: winnerId,
    resolved: true,
  });
}

async function getOrCreateEntryVoteInternal() {
  const db = getAdminDatabase();
  const evRef = db.ref("entryVote/current");
  const snap = await evRef.get();
  const now = Date.now();
  if (snap.exists()) {
    const ev = snap.val() as {
      winner?: string;
      endTime: number;
    };
    if (ev.winner) return ev;
    if (ev.endTime - now > ENTRY_VOTE_MS) {
      return createEntryVote();
    }
    if (ev.endTime > now) return ev;
    await resolveEntryVoteInDB(ev as Record<string, unknown>);
    const snap2 = await evRef.get();
    return snap2.exists() ? snap2.val() : ev;
  }
  return createEntryVote();
}

export async function healEntryVote(): Promise<{ healed: boolean }> {
  await getOrCreateEntryVoteInternal();
  return { healed: true };
}
