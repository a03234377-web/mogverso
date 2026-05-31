"use client";

import type { ReactNode } from "react";
import { Pressable } from "@/components/a11y/Pressable";
import { Icon } from "@/components/icons";
import { Avatar } from "@/features/shared/components/Avatar";
import { cn } from "@/lib/cn";
import type { RankedEntry } from "@/features/rankings/lib/ranking";

type RankRowProps = {
  entry: RankedEntry;
  index: number;
  onOpenProfile: (name: string, rank: number) => void;
};

const RANK_NUM_CLASS = ["rank-num--1", "rank-num--2", "rank-num--3", "rank-num--rest"] as const;
const TOP_ROW_CLASS = ["rank-row--top1", "rank-row--top2", "rank-row--top3"] as const;

export function RankRow({ entry, index, onOpenProfile }: RankRowProps) {
  const { ranker, rank, movement } = entry;
  const rankNumClass = RANK_NUM_CLASS[Math.min(index, 3)];
  const topRowClass = index < 3 ? TOP_ROW_CLASS[index] : undefined;

  let movBadge: ReactNode | null = null;
  if (movement) {
    if (movement.dir === "up") {
      movBadge = (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border",
            "border-[rgba(46,204,113,0.35)] bg-[rgba(46,204,113,0.12)]",
            "px-2.5 py-1 text-sm leading-snug font-black text-lm-green2",
          )}
        >
          <Icon name="trending-up" size={12} className="text-lm-green2" />+
          {movement.delta}
        </span>
      );
    } else if (movement.dir === "down") {
      movBadge = (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border",
            "border-[rgba(255,71,87,0.35)] bg-[rgba(255,71,87,0.12)]",
            "px-2.5 py-1 text-sm leading-snug font-black text-lm-red2",
          )}
        >
          <Icon name="trending-down" size={12} className="text-lm-red2" />-
          {movement.delta}
        </span>
      );
    }
  }

  return (
    <Pressable
      aria-label={`Ver perfil de ${ranker.name}, puesto ${rank}`}
      className={cn(
        "group relative flex min-h-[58px] animate-row-slide items-center gap-3",
        "overflow-hidden rounded-xl border border-lm-border bg-lm-card px-4 py-3",
        "transition-all duration-300 select-none",
        "hover:translate-x-1 hover:border-lm-border2 hover:bg-lm-card2",
        "max-md:gap-2.5 max-md:px-3.5 max-md:hover:translate-x-0",
        "max-md:active:scale-[0.99] max-md:active:border-lm-border2 max-md:active:bg-lm-card2",
        topRowClass,
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onOpenProfile(ranker.name, rank - 1)}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] lm-type-score text-[1.05rem]",
          rankNumClass,
        )}
      >
        {rank}
      </div>
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-lm-border bg-lm-bg3">
        <Avatar name={ranker.name} size={40} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-base leading-snug font-bold">
          {ranker.name}
          {movBadge}
        </div>
        <div className="mt-0.5 truncate text-base leading-snug font-semibold text-lm-text2">
          {ranker.title} · {ranker.sub}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="text-right">
          <div className="lm-type-score text-xl text-lm-gold">{ranker.score}</div>
          <div className="lm-type-label text-lm-text2">Score</div>
        </div>
        <div
          className={cn(
            "text-base text-lm-text2 transition-all duration-200 max-md:hidden",
            "group-hover:translate-x-1 group-hover:text-lm-gold",
          )}
        >
          ›
        </div>
      </div>
    </Pressable>
  );
}
