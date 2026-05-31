"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type WormBorderTheme =
  | "rankvote"
  | "torneo-waiting"
  | "torneo-voting"
  | "torneo-break"
  | "torneo-semifinals";

type WormBorderProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  /** Colores del gradiente vía data-category (consejos) o data-theme. */
  category?: string;
  theme?: WormBorderTheme;
  /** Si true, el gradiente cónico gira al hover. */
  animated?: boolean;
};

/** Borde con dos segmentos en gradiente cónico; opcionalmente animado al hover. */
export function WormBorder({
  children,
  className,
  innerClassName,
  id,
  category,
  theme,
  animated = false,
}: WormBorderProps) {
  return (
    <div
      id={id}
      className={cn(
        "worm-border group",
        animated && "worm-border--animated",
        className,
      )}
      data-category={category}
      data-theme={theme}
    >
      <div className="worm-border__track" aria-hidden="true" />
      <div className={cn("worm-border__inner", innerClassName)}>{children}</div>
    </div>
  );
}
