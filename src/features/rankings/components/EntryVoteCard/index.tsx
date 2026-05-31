"use client";

import { useMemo } from "react";
import { CANDIDATES } from "@/features/rankings/data/candidates";
import { Icon } from "@/components/icons";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { useEntryVote } from "@/features/rankings/hooks/useEntryVote";
import { EntryVoteActive } from "./EntryVoteActive";
import { EntryVoteWinner } from "./EntryVoteWinner";
import { entryVoteCardShellClass } from "./shell-styles";

export function EntryVoteCard() {
  const { ev, myVote, vote, voting } = useEntryVote();
  const cd = useCountdown(ev?.endTime);

  const voted = myVote && ev && myVote.evId === ev.id;
  const total = useMemo(
    () =>
      Math.max(
        1,
        CANDIDATES.reduce((s, c) => s + (ev?.votes?.[c.id] ?? 0), 0),
      ),
    [ev],
  );

  if (!ev) {
    return (
      <div className={entryVoteCardShellClass} id="entryVotingCard">
        <div className="flex items-center justify-center gap-2 px-6 py-8 text-lm-text2">
          <Icon name="hourglass" size={18} className="text-lm-purple" />
          Cargando votación…
        </div>
      </div>
    );
  }

  if (ev.winner) {
    const winnerC = CANDIDATES.find((c) => c.id === ev.winner);
    return <EntryVoteWinner winnerId={ev.winner} winnerC={winnerC} />;
  }

  return (
    <EntryVoteActive
      cd={cd}
      votes={ev.votes}
      total={total}
      voted={!!voted}
      myCandidateId={myVote?.candidate}
      voting={voting}
      onVote={(id) => void vote(id)}
    />
  );
}
