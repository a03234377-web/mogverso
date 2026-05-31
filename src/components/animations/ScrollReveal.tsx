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
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.set(el, HIDDEN(y));
  }, [y]);

  useEffect(() => {
    registerScrollTrigger();
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub,
        },
      });

      if (delay > 0) {
        tl.to({}, { duration: delay });
      }

      tl.fromTo(el, HIDDEN(y), { ...VISIBLE, ease: "none", duration: enterSpan })
        .to(el, { ...VISIBLE, ease: "none", duration: holdSpan })
        .to(el, { ...EXIT(y), ease: "none", duration: exitSpan });
    }, el);

    return () => ctx.revert();
  }, [y, enterSpan, holdSpan, exitSpan, delay, start, end, scrub]);

  return (
    <Tag ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </Tag>
  );
}
