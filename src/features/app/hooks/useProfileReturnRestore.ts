"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

export function useProfileReturnRestore(origin: NavPageId, ready = true) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target = useMemo(
    () => parseProfileTarget(searchParams.get("target")),
    [searchParams],
  );

  useEffect(() => {
    if (!ready) return;

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
          removeTargetFromUrl(pathname, new URLSearchParams(searchParams.toString()));
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
        removeTargetFromUrl(pathname, new URLSearchParams(searchParams.toString()));
      }
    };

    const raf = window.requestAnimationFrame(tryRestore);
    return () => window.cancelAnimationFrame(raf);
  }, [origin, pathname, ready, searchParams, target]);
}
