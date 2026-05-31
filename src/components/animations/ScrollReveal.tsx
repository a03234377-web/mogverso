"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/cn";

let scrollTriggerRegistered = false;

function registerScrollTrigger() {
  if (scrollTriggerRegistered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

/** Evita SecurityError si el DOM está en transición (p. ej. navegación Next.js). */
function safeRefreshTrigger(st: ScrollTrigger | null | undefined) {
  if (!st) return;
  try {
    st.refresh();
  } catch {
    /* ScrollTrigger puede fallar con iframes cross-origin o DOM desmontándose */
  }
}

const HIDDEN = (y: number) => ({ autoAlpha: 0, y, scale: 0.94 });
const VISIBLE = { autoAlpha: 1, y: 0, scale: 1 };
const EXIT = (y: number) => ({ autoAlpha: 0, y: -y * 0.6, scale: 0.94 });

export type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
  enterSpan?: number;
  holdSpan?: number;
  exitSpan?: number;
  delay?: number;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  scrollRange?: "traverse" | "block";
  blockEnd?: string;
  snapVisibleAtBottom?: boolean;
  hideUntilReady?: boolean;
};

/** Entrada/salida ligada al scroll (GSAP ScrollTrigger + scrub). */
export function ScrollReveal({
  children,
  className,
  as: Tag = "div",
  y = 48,
  enterSpan = 0.2,
  holdSpan = 0.6,
  exitSpan = 0.2,
  delay = 0,
  start = "top bottom+=10%",
  end = "bottom top+=10%",
  scrub = true,
  scrollRange = "traverse",
  blockEnd = "top 42%",
  snapVisibleAtBottom = true,
  hideUntilReady = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, VISIBLE);
      el.dataset.revealReady = "true";
      return;
    }
    gsap.set(el, HIDDEN(y));
  }, [y]);

  useEffect(() => {
    registerScrollTrigger();
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const isBlock = scrollRange === "block";
    const resolvedStart = isBlock ? "top bottom+=5%" : start;
    const resolvedEnd = isBlock ? blockEnd : end;
    const resolvedEnterSpan = isBlock ? 0.42 : enterSpan;
    const resolvedHoldSpan = isBlock ? 0.58 : holdSpan;
    const resolvedExitSpan = isBlock ? 0 : exitSpan;
    const resolvedScrub = isBlock ? (typeof scrub === "number" ? scrub : 0.35) : scrub;
    const enterProgress =
      resolvedEnterSpan + resolvedHoldSpan + resolvedExitSpan > 0
        ? resolvedEnterSpan / (resolvedEnterSpan + resolvedHoldSpan + resolvedExitSpan)
        : 1;

    let tl: gsap.core.Timeline;

    const ctx = gsap.context(() => {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: resolvedStart,
          end: resolvedEnd,
          scrub: resolvedScrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            el.style.willChange =
              self.progress > 0 && self.progress < 1 ? "transform, opacity" : "";
          },
        },
      });

      if (delay > 0) {
        tl.to({}, { duration: delay });
      }

      tl.fromTo(el, HIDDEN(y), {
        ...VISIBLE,
        ease: "none",
        duration: resolvedEnterSpan,
      }).to(el, { ...VISIBLE, ease: "none", duration: resolvedHoldSpan });

      if (resolvedExitSpan > 0) {
        tl.to(el, { ...EXIT(y), ease: "none", duration: resolvedExitSpan });
      }
    }, el);

    const syncScrollState = () => {
      if (!el.isConnected) return;

      const st = tl!.scrollTrigger;
      safeRefreshTrigger(st);
      if (!st) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const inView = rect.top < vh && rect.bottom > 0;
      if (!inView) return;

      if (snapVisibleAtBottom) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const atBottom = window.scrollY >= maxScroll - 6;
        if (atBottom && st.progress < enterProgress) {
          tl!.progress(1);
        }
      }
    };

    el.dataset.revealReady = "true";

    let refreshRaf = 0;
    const scheduleSync = () => {
      cancelAnimationFrame(refreshRaf);
      refreshRaf = requestAnimationFrame(syncScrollState);
    };

    scheduleSync();

    const ro = new ResizeObserver(scheduleSync);
    ro.observe(el);
    window.addEventListener("load", scheduleSync);

    return () => {
      cancelAnimationFrame(refreshRaf);
      ro.disconnect();
      window.removeEventListener("load", scheduleSync);
      el.style.willChange = "";
      delete el.dataset.revealReady;
      ctx.revert();
    };
  }, [
    y,
    enterSpan,
    holdSpan,
    exitSpan,
    delay,
    start,
    end,
    scrub,
    scrollRange,
    blockEnd,
    snapVisibleAtBottom,
  ]);

  return (
    <Tag
      ref={ref}
      className={cn(
        className,
        hideUntilReady &&
          "invisible opacity-0 [&[data-reveal-ready=true]]:visible [&[data-reveal-ready=true]]:opacity-100",
      )}
    >
      {children}
    </Tag>
  );
}
