"use client";

import { Icon } from "@/components/icons";
import { RankerProfileLink } from "@/features/rankings/components/ui/RankerProfileLink";
import { cn } from "@/lib/cn";
import { formatSpainDateTimeCompact } from "@/lib/spain-time";

type HistoryEntry = {
  winner: string;
  loser: string;
  wVotes: number;
  lVotes: number;
  ts: number;
  winnerPos?: number;
  loserPos?: number;
  winnerNewPos?: number;
  loserNewPos?: number;
};

export function HistoryRow({ h }: { h: HistoryEntry }) {
  const fmt = formatSpainDateTimeCompact(h.ts);

  if (h.winner === "empate") {
    return (
      <div
        className={cn(
          "mb-2 flex flex-wrap items-center gap-3 rounded-[10px] border border-lm-border",
          "bg-lm-card px-4 py-3",
        )}
      >
        <Icon name="vote" size={14} className="text-lm-text2" />
        <span className="font-bold text-lm-text2">Sin votos · Empate</span>
        <span className="text-base font-bold text-lm-text2">0–0</span>
        <span className="text-base font-semibold text-lm-text2">{fmt}</span>
      </div>
    );
  }

  const posW =
    h.winnerPos && h.winnerNewPos ? ` (#${h.winnerPos}→#${h.winnerNewPos})` : "";
  const posL = h.loserPos && h.loserNewPos ? ` (#${h.loserPos}→#${h.loserNewPos})` : "";

  return (
    <div
      className={cn(
        "mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border border-lm-border",
        "bg-lm-card px-4 py-3 max-md:gap-2 max-md:px-3",
      )}
    >
      <Icon name="vote" size={14} className="shrink-0 text-lm-text2" />
      <span className="font-sans text-base font-semibold text-lm-green2">
        ▲{" "}
        <RankerProfileLink name={h.winner} from="rankvote" className="text-lm-green2" />
        {posW}
      </span>
      <span className="font-sans text-base text-lm-text2">vs</span>
      <span className="font-sans text-base font-semibold text-lm-red2">
        ▼ <RankerProfileLink name={h.loser} from="rankvote" className="text-lm-red2" />
        {posL}
      </span>
      <span className="text-base font-bold text-lm-text2 max-md:basis-full max-md:text-left md:ml-auto">
        {h.wVotes}–{h.lVotes}
      </span>
      <span className="text-base font-semibold text-lm-text2 max-md:basis-full max-md:text-left">
        {fmt}
      </span>
    </div>
  );
}
