"use client";

import { ICON_MAP } from "@/components/icons/icon-map";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types/icons";

export type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 16, className, strokeWidth = 2 }: IconProps) {
  const Cmp = ICON_MAP[name];
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={cn("inline-block shrink-0", className)}
      aria-hidden
    />
  );
}
