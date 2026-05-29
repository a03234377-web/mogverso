"use client";

import { useEffect, useState } from "react";
import { pad } from "@/lib/looksmax/utils";

export type CountdownParts = {
  h: string;
  m: string;
  s: string;
  expired: boolean;
  remainingMs: number;
};

export function useCountdown(endTime: number | null | undefined): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>({
    h: "--",
    m: "--",
    s: "--",
    expired: true,
    remainingMs: 0,
  });

  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000);
      const rem1 = diff - h * 3600000;
      const m = Math.floor(rem1 / 60000);
      const rem2 = rem1 - m * 60000;
      const s = Math.floor(rem2 / 1000);
      setParts({
        h: pad(h),
        m: pad(m),
        s: pad(s),
        expired: diff <= 0,
        remainingMs: diff,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return parts;
}
