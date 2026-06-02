"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { parseAuraScores } from "@/lib/aura/coerce-score";
import type { AuraScores } from "@/types/aura";

const AURA_SCORES_POLL_MS = 20_000;

async function fetchAuraScoresFromApi(): Promise<AuraScores | null> {
  try {
    const res = await fetch("/api/aura/scores", { cache: "no-store" });
    const data = (await res.json()) as {
      ok?: boolean;
      scores?: Record<string, unknown>;
      error?: string;
    };
    if (res.status === 503 || data.error === "server_not_configured") return null;
    if (!data.ok || !data.scores) return null;
    return parseAuraScores(data.scores);
  } catch (err) {
    console.error("[Aura] scores API:", err);
    return null;
  }
}

function mergeScores(remote: AuraScores, patches: AuraScores): AuraScores {
  const merged: AuraScores = { ...remote };
  for (const [key, patchValue] of Object.entries(patches)) {
    const remoteValue = remote[key];
    if (remoteValue === patchValue) continue;
    merged[key] = patchValue;
  }
  return merged;
}

/** Puntuaciones de aura en vivo (RTDB + API de respaldo en /aura). */
export function useAuraScores() {
  const { fb, ready } = useFirebase();
  const [remoteScores, setRemoteScores] = useState<AuraScores>({});
  const [patches, setPatches] = useState<AuraScores>({});
  const [hydrated, setHydrated] = useState(false);
  const pollInFlightRef = useRef(false);

  const applyRemote = useCallback((parsed: AuraScores) => {
    setRemoteScores(parsed);
    setPatches((prev) => {
      const next = { ...prev };
      for (const [key, patchValue] of Object.entries(prev)) {
        if (parsed[key] === patchValue) delete next[key];
      }
      return next;
    });
    setHydrated(true);
  }, []);

  const refreshFromApi = useCallback(async () => {
    if (pollInFlightRef.current) return;
    pollInFlightRef.current = true;
    try {
      const parsed = await fetchAuraScoresFromApi();
      if (parsed !== null) applyRemote(parsed);
    } finally {
      pollInFlightRef.current = false;
    }
  }, [applyRemote]);

  useEffect(() => {
    if (!ready) return;
    void refreshFromApi();
  }, [ready, refreshFromApi]);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    const unsub = onValue(
      ref(db, "aura/scores"),
      (snap) => {
        const parsed = snap.exists() ? parseAuraScores(snap.val()) : {};
        applyRemote(parsed);
      },
      (err) => {
        console.error("[Aura] RTDB aura/scores:", err);
      },
    );

    return () => unsub();
  }, [fb, applyRemote]);

  useEffect(() => {
    if (!ready) return;

    const id = window.setInterval(() => void refreshFromApi(), AURA_SCORES_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshFromApi();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ready, refreshFromApi]);

  const scores = useMemo(
    () => mergeScores(remoteScores, patches),
    [remoteScores, patches],
  );

  const patchScore = useCallback((name: string, aura: number) => {
    const canonical = resolveCanonicalRankerName(name);
    setPatches((prev) => ({ ...prev, [canonical]: aura }));
    setRemoteScores((prev) => ({ ...prev, [canonical]: aura }));
  }, []);

  return {
    ready: ready && hydrated,
    scores,
    patchScore,
    refreshScores: refreshFromApi,
  };
}
