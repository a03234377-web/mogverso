"use client";

import type { ConsejoCategory } from "@/features/consejo/data/consejos";
import { WormBorder } from "@/components/ui/WormBorder";
import type { ReactNode } from "react";

type ConsejoWormTheme = ConsejoCategory | "destacado";

type ConsejoWormBorderProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  category?: ConsejoWormTheme;
};

/** Consejo: gradiente cónico estático al hover (sin giro). */
export function ConsejoWormBorder({
  children,
  className,
  innerClassName,
  category,
}: ConsejoWormBorderProps) {
  return (
    <WormBorder
      animated={false}
      category={category}
      className={className}
      innerClassName={innerClassName}
    >
      {children}
    </WormBorder>
  );
}
