"use client";

import { Icon, type IconProps } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";

type IconLabelProps = {
  icon: IconProps["name"];
  iconSize?: number;
  iconClassName?: string;
  className?: string;
  children: React.ReactNode;
};

/** Icono Lucide + texto en línea */
export function IconLabel({
  icon,
  iconSize = 16,
  iconClassName,
  className,
  children,
}: IconLabelProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <Icon
        name={icon}
        size={iconSize}
        className={cn("relative top-[0.12em] shrink-0 self-auto", iconClassName)}
      />
      <span className="min-w-0 leading-snug">{children}</span>
    </span>
  );
}
