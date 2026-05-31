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

const HIDDEN = (y: number) => ({ autoAlpha: 0, y, scale: 0.96 });
const VISIBLE = { autoAlpha: 1, y: 0, scale: 1 };
const EXIT = (y: number) => ({ autoAlpha: 0, y: -y * 0.55, scale: 0.96 });

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
   * traverse: entra y sale mientras atraviesa el viewport (filas del ranking).
   * inView: solo entrada mientras entra en pantalla; queda visible (bloques al final de página).
   */
  scrollRange?: "traverse" | "inView";
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

    const isInView = scrollRange === "inView";
    const resolvedStart = isInView ? "top bottom+=8%" : start;
    const resolvedEnd = isInView ? "top 72%" : end;
    const resolvedEnterSpan = isInView ? 0.28 : enterSpan;
    const resolvedHoldSpan = isInView ? 0.72 : holdSpan;
    const resolvedExitSpan = isInView ? 0 : exitSpan;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: resolvedStart,
          end: resolvedEnd,
          scrub,
        },
      });

      if (delay > 0) {
        tl.to({}, { duration: delay });
      }

      tl.fromTo(el, HIDDEN(y), {
        ...VISIBLE,
        ease: "none",
        duration: resolvedEnterSpan,
      })
        .to(el, { ...VISIBLE, ease: "none", duration: resolvedHoldSpan });

      if (resolvedExitSpan > 0) {
        tl.to(el, { ...EXIT(y), ease: "none", duration: resolvedExitSpan });
      }
    }, el);

    setGsapReady(true);

    const refresh = () => ScrollTrigger.refresh();
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
  }, [y, enterSpan, holdSpan, exitSpan, delay, start, end, scrub, scrollRange]);

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
