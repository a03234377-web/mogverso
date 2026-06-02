"use client";

import gsap from "gsap";
import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFlipListAnimation } from "@/components/animations/useFlipListAnimation";
import type { AuraLeader } from "@/lib/aura/leaderboard";
import {
  AURA_GSAP_EASE,
  AURA_GSAP_EASE_IN,
  prefersReducedMotion,
} from "@/lib/aura/gsap-motion";

const MOVE_HINT_MS = 1800;
const EXIT_DURATION = 0.34;
const ENTER_DURATION = 0.42;
const ITEM_SELECTOR = "[data-aura-leader-flip-id]";

function leaderOrderKey(leaders: AuraLeader[]): string {
  return leaders.map((l) => `${l.name}:${l.rank}:${l.aura}`).join("|");
}

function detectRankMoves(
  leaders: AuraLeader[],
  prevRanks: Record<string, number>,
): Record<string, "up" | "down"> {
  const hints: Record<string, "up" | "down"> = {};
  for (const leader of leaders) {
    const prev = prevRanks[leader.name];
    if (prev !== undefined && prev !== leader.rank) {
      hints[leader.name] = leader.rank < prev ? "up" : "down";
    }
  }
  return hints;
}

type LeaderMotionState = "enter" | "exit" | null;

export function useAuraLeaderListMotion(
  listRef: RefObject<HTMLElement | null>,
  leaders: AuraLeader[],
  variant: "up" | "down",
  enabled: boolean,
) {
  const prevNamesRef = useRef<Set<string>>(new Set());
  const prevRanksRef = useRef<Record<string, number>>({});
  const exitPendingRef = useRef(0);
  const skipMotionRef = useRef(true);

  const [displayLeaders, setDisplayLeaders] = useState<AuraLeader[]>([]);
  const [moveHints, setMoveHints] = useState<Record<string, "up" | "down">>({});
  const [motionState, setMotionState] = useState<Record<string, LeaderMotionState>>({});

  const orderKey = useMemo(() => leaderOrderKey(leaders), [leaders]);
  const displayOrderKey = useMemo(
    () => leaderOrderKey(displayLeaders),
    [displayLeaders],
  );

  useFlipListAnimation(listRef, displayOrderKey, {
    enabled: enabled && displayLeaders.length > 0,
    itemSelector: ITEM_SELECTOR,
  });

  useLayoutEffect(() => {
    if (!enabled) {
      skipMotionRef.current = true;
      return;
    }

    if (skipMotionRef.current) {
      skipMotionRef.current = false;
      setDisplayLeaders(leaders);
      prevNamesRef.current = new Set(leaders.map((l) => l.name));
      for (const leader of leaders) {
        prevRanksRef.current[leader.name] = leader.rank;
      }
      return;
    }

    const prevNames = prevNamesRef.current;
    const nextNames = new Set(leaders.map((l) => l.name));
    const removed = [...prevNames].filter((name) => !nextNames.has(name));
    const added = leaders.filter((l) => !prevNames.has(l.name)).map((l) => l.name);

    const hints = detectRankMoves(leaders, prevRanksRef.current);
    let hintTimer: number | undefined;
    if (Object.keys(hints).length > 0) {
      setMoveHints(hints);
      hintTimer = window.setTimeout(() => setMoveHints({}), MOVE_HINT_MS);
    }

    const finishExit = () => {
      exitPendingRef.current -= 1;
      if (exitPendingRef.current > 0) return;
      setDisplayLeaders(leaders);
      setMotionState((prev) => {
        const next = { ...prev };
        for (const name of removed) delete next[name];
        return next;
      });
      runEnterAnimations(added);
    };

    const runEnterAnimations = (names: string[]) => {
      if (names.length === 0 || prefersReducedMotion()) return;
      const yFrom = variant === "up" ? -12 : 12;
      for (const name of names) {
        const el = listRef.current?.querySelector<HTMLElement>(
          `${ITEM_SELECTOR}[data-flip-id="${CSS.escape(name)}"]`,
        );
        if (!el) continue;
        gsap.fromTo(
          el,
          { opacity: 0, y: yFrom },
          { opacity: 1, y: 0, duration: ENTER_DURATION, ease: AURA_GSAP_EASE },
        );
      }
    };

    if (removed.length === 0) {
      setDisplayLeaders(leaders);
      if (added.length > 0) {
        setMotionState((prev) => {
          const next = { ...prev };
          for (const name of added) next[name] = "enter";
          return next;
        });
        window.setTimeout(() => {
          setMotionState((prev) => {
            const next = { ...prev };
            for (const name of added) delete next[name];
            return next;
          });
        }, MOVE_HINT_MS);
      }
      requestAnimationFrame(() => runEnterAnimations(added));
    } else {
      setMotionState((prev) => {
        const next = { ...prev };
        for (const name of removed) next[name] = "exit";
        for (const name of added) next[name] = "enter";
        return next;
      });

      if (prefersReducedMotion()) {
        setDisplayLeaders(leaders);
        setMotionState({});
      } else {
        exitPendingRef.current = removed.length;
        let completed = 0;
        for (const name of removed) {
          const el = listRef.current?.querySelector<HTMLElement>(
            `${ITEM_SELECTOR}[data-flip-id="${CSS.escape(name)}"]`,
          );
          if (!el) {
            completed += 1;
            if (completed === removed.length) finishExit();
            continue;
          }
          gsap.to(el, {
            opacity: 0,
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            marginBottom: 0,
            overflow: "hidden",
            duration: EXIT_DURATION,
            ease: AURA_GSAP_EASE_IN,
            onComplete: finishExit,
          });
        }
        if (completed === removed.length) finishExit();
      }
    }

    for (const leader of leaders) {
      prevRanksRef.current[leader.name] = leader.rank;
    }
    prevNamesRef.current = nextNames;

    return () => {
      if (hintTimer !== undefined) window.clearTimeout(hintTimer);
    };
  }, [orderKey, leaders, enabled, variant, listRef]);

  return {
    displayLeaders: enabled ? displayLeaders : [],
    moveHints: enabled ? moveHints : {},
    motionState: enabled ? motionState : {},
  };
}
