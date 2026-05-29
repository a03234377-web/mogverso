"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ActivePageProps = {
  id: string;
  active: boolean;
  children?: ReactNode;
  className?: string;
};

export function ActivePage({ id, active, children, className }: ActivePageProps) {
  if (!active && !children) {
    return <div id={id} className="hidden" />;
  }

  return (
    <div
      id={id}
      className={cn(active ? "block animate-fade-up" : "hidden", className)}
    >
      {active ? children : null}
    </div>
  );
}
