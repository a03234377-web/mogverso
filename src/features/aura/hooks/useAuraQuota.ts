"use client";

import { useEffect, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { getDeviceId } from "@/lib/api/device-id";
import { AURA_VOTES_PER_WEEK } from "@/lib/aura/constants";
import { getMadridWeekId } from "@/lib/aura/periods";
import type { AuraDeviceWeek, AuraMeta } from "@/types/aura";

export function useAuraQuota() {
  const { fb, ready } = useFirebase();
  const [meta, setMeta] = useState<AuraMeta | null>(null);
  const [used, setUsed] = useState(0);

  const weekId = meta?.weekId ?? getMadridWeekId();
  const votesRemaining = Math.max(0, AURA_VOTES_PER_WEEK - used);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    const unsubMeta = onValue(ref(db, "aura/meta"), (snap) => {
      if (snap.exists()) {
        setMeta(snap.val() as AuraMeta);
      } else {
        setMeta({ weekId: getMadridWeekId(), monthId: "" });
      }
    });

    return () => unsubMeta();
  }, [fb]);

  useEffect(() => {
    if (!fb || !weekId) return;
    const deviceId = getDeviceId();
    const { db, ref, onValue } = fb;
    const path = `auraDeviceWeek/dev_${deviceId}_${weekId}`;

    const unsub = onValue(ref(db, path), (snap) => {
      if (!snap.exists()) {
        setUsed(0);
        return;
      }
      const val = snap.val() as AuraDeviceWeek;
      setUsed(typeof val.used === "number" && val.used > 0 ? val.used : 0);
    });

    return () => unsub();
  }, [fb, weekId]);

  return {
    ready,
    votesRemaining,
    votesUsed: used,
    weekId,
    monthId: meta?.monthId ?? null,
  };
}
