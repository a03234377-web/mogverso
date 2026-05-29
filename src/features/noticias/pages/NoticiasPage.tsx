"use client";

import { creatorImage } from "@/assets/creators";
import type { CreatorPhoto } from "@/assets/creators";
import { CreatorImage } from "@/features/shared/components/CreatorImage";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { CreatorIcon, Icon, IconLabel } from "@/components/icons";
import type { IconName } from "@/types/icons";
import { cn } from "@/lib/cn";

export function NoticiasPage() {
  return (
    <ActivePage id="page-noticias" active>
      <PageHeader
        icon="newspaper"
        title="Noticias"
        desc="Lo último del mundo looksmaxer español · Actualizado diariamente"
      />
      <div className="mx-auto max-w-[1000px] px-5 pb-12 max-md:px-3 max-md:pb-6">
        <div className="relative mb-6 animate-breaking-pulse overflow-hidden rounded-[14px] border border-[rgba(255,71,87,0.35)] bg-[linear-gradient(135deg,rgba(192,57,43,0.15),rgba(255,71,87,0.08))] p-5 max-md:rounded-xl max-md:p-4">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-black tracking-[2px] text-lm-red2 uppercase">
            <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-red2" />
            <IconLabel icon="siren" iconSize={12}>
              BREAKING NEWS
            </IconLabel>
          </div>
          <div className="font-display text-[clamp(1.1rem,2.5vw,2.2rem)] leading-tight tracking-[1.5px] text-lm-text max-md:text-[clamp(1rem,4.5vw,1.5rem)]">
            KAPPAH: DE SUB-HUMAN A CHAD ABSOLUTO — LA TRANSFORMACIÓN QUE PARTIÓ EL FORO
            EN DOS
          </div>
          <div className="mt-2.5 text-base leading-normal font-semibold text-lm-text2">
            La operación estética más comentada de la comunidad española.{" "}
            <span className="text-lm-red2">
              Kappah pasó de ser clasificado sub-3 a coronarse #1 del ranking con un
              score de 9.4.
            </span>{" "}
            · Hace 1 hora
          </div>
          <div className="mt-3 font-serif text-base leading-relaxed text-lm-text2 max-md:text-base">
            Kappah era el ejemplo que todos ponían de lo que no se debía ser. Sub-human
            en todos los foros, cara plana, estructura nula. Entonces llegó la
            operación. Mandíbula, mentón, rinoplastia. Hoy es el #1 indiscutible y el
            caso de estudio más citado de la historia del looksmaxing español.
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 max-md:flex-col max-md:gap-3">
            <CompareSide
              label="Antes"
              labelClass="before"
              img={creatorImage("kappahsub.webp")}
              score="Sub-3"
              scoreClass="bad"
            />
            <div className="font-display text-[2.5rem] text-lm-gold opacity-60 max-md:rotate-90 max-md:text-[2rem]">
              →
            </div>
            <CompareSide
              label="Después"
              labelClass="after"
              img={creatorImage("kappah.webp")}
              score="9.4 CHAD"
              scoreClass="good"
            />
          </div>
        </div>
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

function CompareSide({
  label,
  labelClass,
  img,
  score,
  scoreClass,
}: {
  label: string;
  labelClass: "before" | "after";
  img: CreatorPhoto;
  score: string;
  scoreClass: "bad" | "good";
}) {
  return (
    <div className="flex max-w-[280px] min-w-0 flex-1 flex-col items-center gap-1.5 max-md:w-full max-md:max-w-[220px]">
      <div
        className={cn(
          "rounded-full px-2.5 py-0.5 text-sm font-extrabold tracking-[1.5px] uppercase",
          labelClass === "before"
            ? "border border-[rgba(255,71,87,0.3)] bg-[rgba(255,71,87,0.15)] text-lm-red2"
            : "border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.15)] text-lm-green2",
        )}
      >
        {label}
      </div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-white/8 bg-lm-bg3 max-md:rounded-[10px]">
        <CreatorImage
          src={img}
          alt={label}
          className="object-cover object-top"
          sizes="(max-width: 768px) 220px, 280px"
          fallback={<CreatorIcon name="" size={40} className="opacity-40" />}
        />
      </div>
      <div
        className={cn(
          "font-display text-base tracking-[1.5px]",
          scoreClass === "bad" ? "text-lm-red2" : "text-lm-green2",
        )}
      >
        {score}
      </div>
    </div>
  );
}

const noticiaCatColors: Record<string, string> = {
  ranking: "text-lm-gold",
  drama: "text-lm-red2",
  ascension: "text-lm-green2",
  comunidad: "text-lm-purple",
};

function NoticiaCard({
  cat,
  catIcon,
  catLabel,
  title,
  body,
  tag,
  time,
}: {
  cat: string;
  catIcon: IconName;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
  time: string;
}) {
  return (
    <div className="rounded-xl border border-lm-border bg-lm-card p-4">
      <div
        className={cn(
          "mb-1.5 flex items-center gap-1 text-sm font-extrabold tracking-[1.5px] uppercase",
          noticiaCatColors[cat] ?? "text-lm-text2",
        )}
      >
        <Icon name={catIcon} size={12} />
        {catLabel}
      </div>
      <div className="mb-1.5 text-base leading-snug font-extrabold">{title}</div>
      <div className="font-serif text-base leading-normal text-lm-text2">{body}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-sm font-semibold text-lm-text2">
        <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-sm font-bold">
          {tag}
        </span>
        <span>{time}</span>
      </div>
    </div>
  );
}
