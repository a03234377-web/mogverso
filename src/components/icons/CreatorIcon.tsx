"use client";

import { Icon } from "@/components/icons/Icon";
import { getRankerFallback } from "@/features/rankings/data/avatars";
import type { IconName } from "@/types/icons";

type CreatorIconProps = {
  name: string;
  icon?: IconName;
  size?: number;
  className?: string;
};

export function CreatorIcon({ name, icon, size = 20, className }: CreatorIconProps) {
  return (
    <Icon name={icon ?? getRankerFallback(name)} size={size} className={className} />
  );
}
