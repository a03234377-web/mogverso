import type { KeyboardEvent } from "react";
import { isActivationKey } from "@/lib/a11y/keyboard";

/** Invoca `action` en Enter o Space (WCAG para controles tipo botón). */
export function activateOnKey(
  e: KeyboardEvent,
  action: () => void,
  options?: { disabled?: boolean },
): void {
  if (options?.disabled) return;
  if (!isActivationKey(e.key)) return;
  e.preventDefault();
  action();
}
