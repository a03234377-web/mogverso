"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ActivePageProps = {
  id: string;
  active: boolean;
  children?: ReactNode;
  className?: string;
  /** Entrada con fade-up (desactivar en torneo live). */
  entrance?: boolean;
};

export function ActivePage({
  id,
  active,
  children,
  className,
  entrance = true,
}: ActivePageProps) {
  if (!active && !children) {
    return <div id={id} className="hidden" />;
  }

  return (
    <div
      id={id}
      className={cn(
        active ? "block" : "hidden",
        entrance && active && "animate-fade-up",
        className,
      )}
    >
      {active ? children : null}
    </div>
  );
}
