"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFlipListAnimation } from "@/components/animations/useFlipListAnimation";
import { useGsapStaggerEntrance } from "@/features/aura/hooks/useGsapStaggerEntrance";
import { AuraVoteRow } from "@/features/aura/components/AuraVoteRow";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { profileTargetId } from "@/features/rankings/lib/profile-slug";
import type { RankedEntry } from "@/features/rankings/lib/ranking";
import type { AuraScores } from "@/types/aura";

const MOVE_HINT_MS = 1800;

type AuraVoteListProps = {
  entries: RankedEntry[];
  scores: AuraScores;
  listReady: boolean;
  disabledFor: (name: string) => boolean;
  hasVotedFor: (name: string) => boolean;
  votingName: string | null;
  voteSuccessName: string | null;
  lastVoteDelta: { name: string; delta: number } | null;
  focusTarget?: string | null;
  onBoost: (name: string) => void;
  onPenalty: (name: string) => void;
  onOpenProfile: (name: string, rank: number) => void;
};

function detectRankMoves(
  entries: RankedEntry[],
  prevRanks: Record<string, number>,
): Record<string, "up" | "down"> {
  const hints: Record<string, "up" | "down"> = {};
  for (const entry of entries) {
    const prev = prevRanks[entry.name];
    if (prev !== undefined && prev !== entry.rank) {
      hints[entry.name] = entry.rank < prev ? "up" : "down";
    }
  }
  return hints;
}

export function AuraVoteList({
  entries,
  scores,
  listReady,
  disabledFor,
  hasVotedFor,
  votingName,
  voteSuccessName,
  lastVoteDelta,
  focusTarget = null,
  onBoost,
  onPenalty,
  onOpenProfile,
}: AuraVoteListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevRanksRef = useRef<Record<string, number>>({});
  const [moveHints, setMoveHints] = useState<Record<string, "up" | "down">>({});

  const orderKey = useMemo(
    () => entries.map((e) => `${e.name}:${e.rank}`).join("|"),
    [entries],
  );

  useFlipListAnimation(listRef, orderKey, {
    enabled: listReady,
    itemSelector: "[data-aura-flip-id]",
  });

  useGsapStaggerEntrance(listRef, listReady && entries.length > 0, {
    itemSelector: "[data-aura-flip-id]",
    y: 12,
    duration: 0.34,
    staggerAmount: 0.55,
  });

  useLayoutEffect(() => {
    if (!listReady) return;

    const hints = detectRankMoves(entries, prevRanksRef.current);
    for (const entry of entries) {
      prevRanksRef.current[entry.name] = entry.rank;
    }

    if (Object.keys(hints).length === 0) return;

    setMoveHints(hints);

    const id = window.setTimeout(() => setMoveHints({}), MOVE_HINT_MS);
    return () => window.clearTimeout(id);
  }, [orderKey, entries, listReady]);

  if (!listReady) {
    return <div className="py-8 text-center text-lm-text2">Cargando aura…</div>;
  }

  return (
    <div ref={listRef} className="flex flex-col gap-2">
      {entries.map((entry) => (
        <div key={entry.name} data-aura-flip-id={entry.name} data-flip-id={entry.name}>
          <AuraVoteRow
            entry={entry}
            scores={scores}
            disabled={disabledFor(entry.ranker.name)}
            alreadyVoted={hasVotedFor(entry.ranker.name)}
            votingName={votingName}
            voteSuccessName={voteSuccessName}
            voteDelta={
              lastVoteDelta?.name === resolveCanonicalRankerName(entry.ranker.name)
                ? lastVoteDelta.delta
                : null
            }
            moveHint={moveHints[entry.name] ?? null}
            isVoteFocus={
              Boolean(focusTarget) && focusTarget === profileTargetId(entry.ranker.name)
            }
            onBoost={onBoost}
            onPenalty={onPenalty}
            onOpenProfile={onOpenProfile}
          />
        </div>
      ))}
    </div>
  );
}
