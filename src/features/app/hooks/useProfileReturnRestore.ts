"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { parseProfileTarget, type NavPageId } from "@/features/app/routes";
import {
  clearProfileReturnContext,
  readProfileReturnContext,
} from "@/features/app/profile-return-context";

function removeTargetFromUrl(pathname: string, searchParams: URLSearchParams): void {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete("target");
  const nextUrl =
    nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname;
  window.history.replaceState(window.history.state, "", nextUrl);
}

/** Restores scroll/target after returning from profile (client-only; no useSearchParams). */
export function useProfileReturnRestore(origin: NavPageId, ready = true) {
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    const searchParams = new URLSearchParams(window.location.search);
    const target = parseProfileTarget(searchParams.get("target"));
    const saved = readProfileReturnContext();
    const canUseSaved = saved?.from === origin ? saved : null;
    const hasTarget = Boolean(target);
    const hasScrollFallback = Boolean(canUseSaved && canUseSaved.scrollY > 0);
    if (!hasTarget && !hasScrollFallback) return;

    let attempts = 0;
    const maxAttempts = 12;

    const tryRestore = () => {
      attempts += 1;

      if (target) {
        const row = document.querySelector<HTMLElement>(
          `[data-profile-target="${target}"]`,
        );
        if (row) {
          row.scrollIntoView({ block: "center", behavior: "auto" });
          clearProfileReturnContext();
          removeTargetFromUrl(pathname, searchParams);
          return;
        }
      }

      if (!target && canUseSaved) {
        window.scrollTo({ top: canUseSaved.scrollY, behavior: "auto" });
        clearProfileReturnContext();
        return;
      }

      if (attempts < maxAttempts) {
        window.setTimeout(tryRestore, 80);
        return;
      }

      if (canUseSaved) {
        window.scrollTo({ top: canUseSaved.scrollY, behavior: "auto" });
        clearProfileReturnContext();
      }
      if (target) {
        removeTargetFromUrl(pathname, searchParams);
      }
    };

    const raf = window.requestAnimationFrame(tryRestore);
    return () => window.cancelAnimationFrame(raf);
  }, [origin, pathname, ready]);
}
