"use client";

import { useEffect, useState } from "react";
import { parseProfileTarget } from "@/features/app/routes";

const FOCUS_DURATION_MS = 6000;

function readTargetFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return parseProfileTarget(new URLSearchParams(window.location.search).get("target"));
}

/** Resalta la fila indicada por `?target=` (p. ej. al llegar desde perfil). */
export function useProfileTargetFocus(ready: boolean) {
  const [slug] = useState(readTargetFromUrl);
  const [visible, setVisible] = useState(() => Boolean(readTargetFromUrl()));

  useEffect(() => {
    if (!ready || !slug) return;
    const id = window.setTimeout(() => setVisible(false), FOCUS_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [ready, slug]);

  if (!ready || !visible || !slug) return null;
  return slug;
}
