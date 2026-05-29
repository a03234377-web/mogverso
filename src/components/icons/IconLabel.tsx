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
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon name={icon} size={iconSize} className={iconClassName} />
      {children}
    </span>
  );
}
