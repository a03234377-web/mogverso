"use client";

import { useCallback, useEffect, useState } from "react";
import { useFirebase } from "@/contexts/FirebaseProvider";
import type { EntryVote, EntryVoteMyVote } from "@/lib/looksmax/types";

export function useEntryVote() {
  const { fb } = useFirebase();
  const [ev, setEv] = useState<EntryVote | null>(null);
  const [myVote, setMyVote] = useState<EntryVoteMyVote | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue, get, DEVICE_ID } = fb;

    const unsub = onValue(ref(db, "entryVote/current"), async (snap) => {
      let current: EntryVote | null = null;
      if (snap.exists()) {
        const val = snap.val() as EntryVote & { winner?: string };
        if (!val.winner && val.endTime <= Date.now()) {
          await fb.resolveEntryVoteInDB(val as Record<string, unknown>);
          return;
        }
        current = val;
      } else {
        current = (await fb.getOrCreateEntryVote()) as EntryVote;
      }

      if (!current) return;
      setEv(current);

      const voteSnap = await get(
        ref(db, `entryVotes/dev_${DEVICE_ID}_${current.id}`),
      );
      setMyVote(
        voteSnap.exists()
          ? { evId: current.id, candidate: voteSnap.val().candidate as string }
          : null,
      );
    });

    return () => unsub();
  }, [fb]);

  const vote = useCallback(
    async (candidateId: string) => {
      if (!fb || !ev || voting) return false;
      setVoting(true);
      try {
        const ok = await fb.castEntryVoteDB(candidateId);
        if (ok) {
          const snap = await fb.get(fb.ref(fb.db, "entryVote/current"));
          const fresh = snap.exists() ? (snap.val() as EntryVote) : ev;
          setEv(fresh);
          setMyVote({ evId: fresh.id, candidate: candidateId });
        }
        return ok;
      } finally {
        setVoting(false);
      }
    },
    [fb, ev, voting],
  );

  return { ev, myVote, vote, voting };
}
