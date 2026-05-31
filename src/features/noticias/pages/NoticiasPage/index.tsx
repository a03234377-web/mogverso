"use client";

import { PageHeader } from "@/features/shared/components/PageHeader";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { BreakingNewsCard } from "./BreakingNewsCard";
import { NoticiaCard } from "./NoticiaCard";

export function NoticiasPage() {
  return (
    <ActivePage id="page-noticias" active>
      <PageHeader
        icon="newspaper"
        title="Noticias"
        desc="Lo último del mundo looksmaxer español · Actualizado diariamente"
        variant="readable"
      />
      <div className="mx-auto max-w-[1000px] px-5 pb-12 max-md:px-3 max-md:pb-6">
        <BreakingNewsCard />
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2.5">
          <NoticiaCard
            cat="ranking"
            catIcon="trophy"
            catLabel="Rankings"
            title="Kappah defiende el #1 con score histórico de 9.4"
            body="El TikToker más transformado de la comunidad española consolida su reinado."
            tag="RANKING"
            time="hace 1h"
          />
          <NoticiaCard
            cat="ascension"
            catIcon="trending-up"
            catLabel="Ascensión"
            title="RubenMaxxing sube al #2 con nuevo análisis viral"
            body="Su vídeo de análisis facial supera las 200K vistas y la comunidad lo nombra referente técnico."
            tag="ANÁLISIS"
            time="hace 3h"
          />
          <NoticiaCard
            cat="ascension"
            catIcon="cookie"
            catLabel="Podio"
            title="TitoChape asciende al #3 — el cookie en el podio"
            body="TitoChape sube al Top 3 con una temporada impresionante."
            tag="PODIO"
            time="hace 2h"
          />
          <NoticiaCard
            cat="ascension"
            catIcon="sparkles"
            catLabel="Entradas Nuevas"
            title="Franbv y Nil Ojeda: los nuevos candidatos al ranking"
            body="Dos de los debuts más esperados de la temporada. ¡Vota quién entra primero!"
            tag="DEBUT"
            time="hace 1h"
          />
          <NoticiaCard
            cat="comunidad"
            catIcon="message-circle"
            catLabel="Comunidad"
            title="JordiWild, Peldanyos, IbaiLlanos y ChiquiIbai en el ranking"
            body="Los creadores más reconocidos de España generan debate histórico en la comunidad."
            tag="TIKTOKER"
            time="hace 8h"
          />
        </div>
      </div>
    </ActivePage>
  );
}
