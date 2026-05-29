"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "rgba(232,184,75",
  "rgba(168,85,247",
  "rgba(59,130,246",
  "rgba(46,204,113",
];

export function Particles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    wrap.innerHTML = "";
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("div");
      p.className = "particle absolute rounded-full";
      const sz = 1 + Math.random() * 3;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      p.style.cssText = `left:${Math.random() * 100}%;--drift:${(Math.random() - 0.5) * 200}px;animation-duration:${7 + Math.random() * 13}s;animation-delay:${Math.random() * 18}s;opacity:0;width:${sz}px;height:${sz}px;background:${color},${0.4 + Math.random() * 0.4})`;
      wrap.appendChild(p);
    }
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] overflow-hidden"
      id="particles"
      ref={ref}
    />
  );
}
