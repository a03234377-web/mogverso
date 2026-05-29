"use client";

import { useMemo, useState } from "react";
import { LEXICO } from "@/features/lexico/data/lexico";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";

export function LexicoPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return LEXICO;
    return LEXICO.filter(
      (l) =>
        l.term.toLowerCase().includes(q) ||
        l.en.toLowerCase().includes(q) ||
        l.def.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <ActivePage id="page-lexico" active>
      <PageHeader
        icon="book-marked"
        title="Léxico"
        desc="Términos esenciales del looksmaxing explicados en español"
      />
      <div className="mx-auto max-w-[900px] px-5 pb-12 max-md:px-3 max-md:pb-6">
        <div className="relative mb-5">
          <Icon
            name="search"
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-lm-text2"
          />
          <input
            type="text"
            placeholder="Buscar término..."
            id="lexicoInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full cursor-text rounded-[10px] border border-lm-border bg-lm-card py-3 pr-4 pl-10 font-sans text-base text-lm-text lm-focus-ring transition-colors duration-300 outline-none focus-visible:border-lm-border2 max-md:min-h-11 max-md:text-base"
          />
        </div>
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5 max-md:grid-cols-1"
          id="lexicoGrid"
        >
          {filtered.map((l) => (
            <div
              key={l.term}
              className="rounded-[10px] border border-lm-border bg-lm-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-lm-border2"
              data-term={l.term.toLowerCase()}
            >
              <div className="mb-0.5 font-display text-[1.1rem] tracking-[1.5px] text-lm-gold">
                {l.term}
              </div>
              <div className="mb-2 text-sm font-semibold tracking-[0.8px] text-lm-text2 uppercase">
                {l.en}
              </div>
              <div className="font-serif text-base leading-normal text-lm-text2">
                {l.def}
              </div>
              <div
                className={cn(
                  "mt-2 inline-block rounded-full px-1.5 py-0.5 text-sm font-extrabold tracking-[0.8px] uppercase",
                  l.nivel === "basico" && "bg-[rgba(46,204,113,0.15)] text-lm-green2",
                  l.nivel === "medio" && "bg-[rgba(232,184,75,0.15)] text-lm-gold",
                  l.nivel === "avanzado" && "bg-[rgba(255,71,87,0.15)] text-lm-red2",
                )}
              >
                {l.nivel.charAt(0).toUpperCase() + l.nivel.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ActivePage>
  );
}
