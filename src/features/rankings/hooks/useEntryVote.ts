"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { healEntryVoteApi, voteEntryApi } from "@/lib/api/vote-client";
import { isValidEntryVoteCandidate } from "@/lib/firebase/validate-vote";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import type { EntryVote, EntryVoteMyVote } from "@/types/looksmax";
import { ENTRY_VOTE_MS } from "@/lib/vote-intervals";

export function useEntryVote() {
  const { fb } = useFirebase();
  const { getToken } = useRecaptcha("entry_vote");
  const [ev, setEv] = useState<EntryVote | null>(null);
  const [myVote, setMyVote] = useState<EntryVoteMyVote | null>(null);
  const [voting, setVoting] = useState(false);
  const lastHealRef = useRef(0);

  const requestHeal = useCallback(async () => {
    const now = Date.now();
    if (now - lastHealRef.current < 2000) return;
    lastHealRef.current = now;
    await healEntryVoteApi();
  }, []);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue, get, DEVICE_ID } = fb;

    const unsub = onValue(ref(db, "entryVote/current"), async (snap) => {
      let current: EntryVote | null = null;
      if (snap.exists()) {
        const val = snap.val() as EntryVote & { winner?: string };
        const remaining = val.endTime - Date.now();
        if (!val.winner && remaining <= 0) {
          await requestHeal();
          const resolved = await get(ref(db, "entryVote/current"));
          current = resolved.exists() ? (resolved.val() as EntryVote) : val;
        } else if (!val.winner && remaining > ENTRY_VOTE_MS) {
          await requestHeal();
          const refreshed = await get(ref(db, "entryVote/current"));
          current = refreshed.exists() ? (refreshed.val() as EntryVote) : val;
        } else {
          current = val;
        }
      } else {
        await requestHeal();
        const created = await get(ref(db, "entryVote/current"));
        current = created.exists() ? (created.val() as EntryVote) : null;
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
  }, [fb, requestHeal]);

  const vote = useCallback(
    async (candidateId: string) => {
      if (!fb || !ev || voting) return false;
      if (!isValidEntryVoteCandidate(candidateId)) return false;
      setVoting(true);
      try {
        const token = await getToken();
        const result = await voteEntryApi(candidateId, token);
        if (result.ok) {
          const snap = await fb.get(fb.ref(fb.db, "entryVote/current"));
          const fresh = snap.exists() ? (snap.val() as EntryVote) : ev;
          setEv(fresh);
          setMyVote({ evId: fresh.id, candidate: candidateId });
        }
        return result.ok;
      } finally {
        setVoting(false);
      }
    },
    [fb, ev, voting, getToken],
  );

  return { ev, myVote, vote, voting };
}
