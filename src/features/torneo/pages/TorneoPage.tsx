"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { TorneoComingSoon } from "@/features/torneo/pages/TorneoComingSoon";
import { TorneoLiveView } from "@/features/torneo/pages/TorneoLiveView";
import type { TorneoPhase } from "@/types/looksmax";
import { shouldShowTorneoComingSoon } from "@/lib/torneo-schedule";
import { healTorneoApi } from "@/lib/api/vote-client";

function useTorneoPhase() {
  const { fb } = useFirebase();
  const [phase, setPhase] = useState<TorneoPhase | null>(null);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;
    const unsub = onValue(ref(db, "torneo/state/phase"), (snap) => {
      setPhase(snap.exists() ? (snap.val() as TorneoPhase) : null);
    });
    return () => unsub();
  }, [fb]);

  return phase;
}

export function TorneoPage() {
  const [now, setNow] = useState(() => Date.now());
  const phase = useTorneoPhase();
  const showComingSoon = shouldShowTorneoComingSoon(now, phase);

  useEffect(() => {
    void healTorneoApi().catch((err) => {
      console.error("[Torneo] heal on mount:", err);
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const id = requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* DOM en transición */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [showComingSoon]);

  if (showComingSoon) {
    return <TorneoComingSoon />;
  }

  return <TorneoLiveView />;
}
