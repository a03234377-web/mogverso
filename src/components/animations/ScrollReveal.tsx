"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let scrollTriggerRegistered = false;

function registerScrollTrigger() {
  if (scrollTriggerRegistered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

const HIDDEN = (y: number) => ({ autoAlpha: 0, y, scale: 0.94 });
const VISIBLE = { autoAlpha: 1, y: 0, scale: 1 };
const EXIT = (y: number) => ({ autoAlpha: 0, y: -y * 0.6, scale: 0.94 });

export type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Desplazamiento inicial en px (positivo = desde abajo). */
  y?: number;
  /** Peso relativo de la fase de entrada en el timeline (solo proporciones). */
  enterSpan?: number;
  /** Peso relativo de la fase visible antes de salir. */
  holdSpan?: number;
  /** Peso relativo de la fase de salida. */
  exitSpan?: number;
  /** Desplaza la entrada en el recorrido de scroll (fracción del timeline). */
  delay?: number;
  /** Inicio del tramo de scroll (elemento asomando por abajo). */
  start?: string;
  /** Fin del tramo de scroll (elemento saliendo por arriba). */
  end?: string;
  /** true = 1:1 con el scroll; número = suavizado mínimo en segundos. */
  scrub?: boolean | number;
  /**
   * traverse: recorrido start/end (filas del ranking).
   * block: entra al bajar (aparece) y sale al subir; progress 1 = totalmente visible.
   */
  scrollRange?: "traverse" | "block";
  /** block: posición final del trigger (progress 1 = visible, no oculto). */
  blockEnd?: string;
  /** Si el bloque ya está visible al llegar al final de página, forzar estado visible. */
  snapVisibleAtBottom?: boolean;
  /** Oculto hasta que GSAP tome el control (evita flash al hidratar). */
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
  const [gsapReady, setGsapReady] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, VISIBLE);
      setGsapReady(true);
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
      ScrollTrigger.refresh();
      const st = tl!.scrollTrigger;
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

    setGsapReady(true);

    const refresh = () => {
      syncScrollState();
    };
    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(el);
    window.addEventListener("load", refresh);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", refresh);
      ctx.revert();
      setGsapReady(false);
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
      className={className}
      style={{
        willChange: "transform, opacity",
        ...(!gsapReady && hideUntilReady
          ? { opacity: 0, visibility: "hidden" as const }
          : undefined),
      }}
    >
      {children}
    </Tag>
  );
}
