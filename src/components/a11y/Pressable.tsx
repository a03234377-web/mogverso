"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type PressableProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
};

/** Botón con reset visual para tarjetas/listas clicables. */
export function Pressable({ children, className, type = "button", ...props }: PressableProps) {
  return (
    <button
      type={type}
      className={cn(
        "lm-focus-ring m-0 w-full cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-inherit",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
