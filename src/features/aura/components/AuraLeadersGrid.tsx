"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AuraLeadersGridProps = {
  children: ReactNode;
  className?: string;
};

/** Contenedor del grid Más/Menos Aura. */
export function AuraLeadersGrid({ children, className }: AuraLeadersGridProps) {
  return <div className={cn(className)}>{children}</div>;
}
