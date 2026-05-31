"use client";

import { PageHeader } from "@/components/PageHeader";
import { SpainTimezoneNote } from "@/components/ui/SpainTimezoneNote";
import { ActivePage } from "@/components/ui/ActivePage";
import { BreakingNewsCard } from "./BreakingNewsCard";
import { NoticiasFeed } from "./NoticiasFeed";

export function NoticiasPage() {
  return (
    <ActivePage id="page-noticias" active>
      <PageHeader
        icon="newspaper"
        title="Noticias"
        desc="Eventos reales del ranking, Rank Vote y torneo · Actualizado en tiempo real"
        variant="readable"
      />
      <div className="mx-auto max-w-[1000px] px-5 pb-12 max-md:px-3 max-md:pb-6">
        <SpainTimezoneNote className="mb-4" />
        <NoticiasFeed />
        <BreakingNewsCard />
      </div>
    </ActivePage>
  );
}
