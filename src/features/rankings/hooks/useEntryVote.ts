"use client";

import { useCallback, useEffect, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import type { EntryVote, EntryVoteMyVote } from "@/features/shared/lib/types";
import { ENTRY_VOTE_MS } from "@/lib/vote-intervals";

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
        const remaining = val.endTime - Date.now();
        if (!val.winner && remaining <= 0) {
          await fb.resolveEntryVoteInDB(val as Record<string, unknown>);
          const resolved = await get(ref(db, "entryVote/current"));
          current = resolved.exists() ? (resolved.val() as EntryVote) : val;
        } else if (!val.winner && remaining > ENTRY_VOTE_MS) {
          current = (await fb.getOrCreateEntryVote()) as EntryVote;
        } else {
          current = val;
        }
      } else {
        current = (await fb.getOrCreateEntryVote()) as EntryVote;
      }

      if (!current) return;
      setEv(current);

      const voteSnap = await get(ref(db, `entryVotes/dev_${DEVICE_ID}_${current.id}`));
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
