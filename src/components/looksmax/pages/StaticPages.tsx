"use client";

import { useMemo, useState } from "react";
import { LEXICO } from "@/data/lexico";
import { ActivePage } from "@/components/looksmax/ui/ActivePage";
import { cn } from "@/lib/cn";

function PageHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-4 pt-8 max-md:px-4 max-md:pb-2 max-md:pt-5">
      <div className="font-display bg-[linear-gradient(135deg,var(--color-lm-text)_0%,var(--color-lm-gold2)_60%,var(--color-lm-gold)_100%)] bg-clip-text text-[clamp(1.6rem,4vw,3.5rem)] tracking-[3px] text-transparent max-md:text-[clamp(1.5rem,6vw,2.2rem)]">
        {title}
      </div>
      <div className="mt-1 text-[0.8rem] font-semibold leading-snug text-lm-text2 max-md:text-[0.75rem]">
        {desc}
      </div>
    </div>
  );
}

export function NoticiasPage({ active }: { active: boolean }) {
  return (
    <ActivePage id="page-noticias" active={active}>
      <PageHeader
        title="📰 Noticias"
        desc="Lo último del mundo looksmaxer español · Actualizado diariamente"
      />
      <div className="mx-auto max-w-[1000px] px-5 max-md:px-3">
        <div className="animate-breaking-pulse relative mb-6 overflow-hidden rounded-[14px] border border-[rgba(255,71,87,0.35)] bg-[linear-gradient(135deg,rgba(192,57,43,0.15),rgba(255,71,87,0.08))] p-5 max-md:rounded-xl max-md:p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-[2px] text-lm-red2">
            <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-red2" />
            🚨 BREAKING NEWS 🚨
          </div>
          <div className="font-display text-[clamp(1.1rem,2.5vw,2.2rem)] leading-tight tracking-[1.5px] text-lm-text max-md:text-[clamp(1rem,4.5vw,1.5rem)]">
            KAPPAH: DE SUB-HUMAN A CHAD ABSOLUTO — LA TRANSFORMACIÓN QUE PARTIÓ EL FORO EN DOS
          </div>
          <div className="mt-2.5 text-[0.7rem] font-semibold leading-normal text-lm-text2">
            La operación estética más comentada de la comunidad española.{" "}
            <span className="text-lm-red2">
              Kappah pasó de ser clasificado sub-3 a coronarse #1 del ranking con un score de 9.4.
            </span>{" "}
            · Hace 1 hora
          </div>
          <div className="mt-3 font-serif text-[0.95rem] leading-relaxed text-lm-text2 max-md:text-[0.88rem]">
            Kappah era el ejemplo que todos ponían de lo que no se debía ser. Sub-human en todos los
            foros, cara plana, estructura nula. Entonces llegó la operación. Mandíbula, mentón,
            rinoplastia. Hoy es el #1 indiscutible y el caso de estudio más citado de la historia del
            looksmaxing español.
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <CompareSide
              label="Antes"
              labelClass="before"
              img="/img/kappahsub.png"
              score="Sub-3"
              scoreClass="bad"
            />
            <div className="font-display text-[2.5rem] text-lm-gold opacity-60">→</div>
            <CompareSide
              label="Después"
              labelClass="after"
              img="/img/kappah.png"
              score="9.4 CHAD"
              scoreClass="good"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2.5">
          <NoticiaCard cat="ranking" catLabel="🏆 Rankings" title="Kappah defiende el #1 con score histórico de 9.4" body="El TikToker más transformado de la comunidad española consolida su reinado." tag="RANKING" time="hace 1h" />
          <NoticiaCard cat="ascension" catLabel="📈 Ascensión" title="RubenMaxxing sube al #2 con nuevo análisis viral" body="Su vídeo de análisis facial supera las 200K vistas y la comunidad lo nombra referente técnico." tag="ANÁLISIS" time="hace 3h" />
          <NoticiaCard cat="ascension" catLabel="🍪 Podio" title="TitoChape asciende al #3 — el cookie en el podio" body="TitoChape sube al Top 3 con una temporada impresionante." tag="PODIO" time="hace 2h" />
          <NoticiaCard cat="ascension" catLabel="🌟 Entradas Nuevas" title="Franbv y Nil Ojeda: los nuevos candidatos al ranking" body="Dos de los debuts más esperados de la temporada. ¡Vota quién entra primero!" tag="DEBUT" time="hace 1h" />
          <NoticiaCard cat="comunidad" catLabel="💬 Comunidad" title="JordiWild, Peldanyos, IbaiLlanos y ChiquiIbai en el ranking" body="Los creadores más reconocidos de España generan debate histórico en la comunidad." tag="TIKTOKER" time="hace 8h" />
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
  img: string;
  score: string;
  scoreClass: "bad" | "good";
}) {
  return (
    <div className="flex min-w-[140px] max-w-[280px] flex-1 flex-col items-center gap-1.5">
      <div
        className={cn(
          "rounded-full px-2.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[1.5px]",
          labelClass === "before"
            ? "border border-[rgba(255,71,87,0.3)] bg-[rgba(255,71,87,0.15)] text-lm-red2"
            : "border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.15)] text-lm-green2",
        )}
      >
        {label}
      </div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-white/8 bg-lm-bg3 max-md:rounded-[10px]">
        <img src={img} alt={label} className="block h-full w-full object-cover object-top" />
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
  catLabel,
  title,
  body,
  tag,
  time,
}: {
  cat: string;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
  time: string;
}) {
  return (
    <div className="cursor-pointer rounded-xl border border-lm-border bg-lm-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-lm-border2">
      <div
        className={cn(
          "mb-1.5 text-[0.6rem] font-extrabold uppercase tracking-[1.5px]",
          noticiaCatColors[cat] ?? "text-lm-text2",
        )}
      >
        {catLabel}
      </div>
      <div className="mb-1.5 text-[0.95rem] font-extrabold leading-snug">{title}</div>
      <div className="font-serif text-[0.9rem] leading-normal text-lm-text2">{body}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-[0.65rem] font-semibold text-lm-text2">
        <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-[0.58rem] font-bold">
          {tag}
        </span>
        <span>{time}</span>
      </div>
    </div>
  );
}

export function ConsejoPage({ active }: { active: boolean }) {
  return (
    <ActivePage id="page-consejo" active={active}>
      <PageHeader title="📖 Consejos" desc="Guía diaria para mejorar tu físico y presencia" />
      <div className="mx-auto max-w-[900px] px-5 max-md:px-3">
        <div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2.5">
          <div className="col-span-full flex items-start gap-5 rounded-xl border border-[rgba(232,184,75,0.35)] bg-lm-card p-5 max-md:flex-row">
            <div className="shrink-0 text-[2.2rem] max-md:text-[1.8rem]">☀️</div>
            <div>
              <div className="mb-1.5 text-[0.6rem] font-extrabold uppercase tracking-[1.5px] text-lm-gold">
                ⭐ Consejo del Día
              </div>
              <h3 className="mb-1.5 text-[0.9rem] font-extrabold leading-snug max-md:text-[0.88rem]">
                La Regla del 3–6–9 en Hidratación Cutánea
              </h3>
              <p className="font-serif text-[0.9rem] leading-normal text-lm-text2">
                Aplica hidratante con SPF 30+ por la mañana, ácido hialurónico al mediodía, y retinol
                por la noche. La consistencia supera a cualquier producto milagroso.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[0.65rem] text-lm-text2">
                <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-[0.58rem] font-bold">
                  PIEL
                </span>
                <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-[0.58rem] font-bold">
                  HIDRATACIÓN
                </span>
              </div>
            </div>
          </div>
          <ConsejoCard cat="gym" catLabel="💪 Gym" title="Mewing + Mordida" body="El mewing correcto sin una oclusión trabajada es la mitad del trabajo. Consulta a un ortodoncista." tag="JAW" />
          <ConsejoCard cat="nutricion" catLabel="🥩 Nutrición" title="Proteína + Colágeno" body="2g de proteína por kg de peso, más 10g de colágeno hidrolizado con vitamina C en ayunas." tag="DIETA" />
          <ConsejoCard cat="estilo" catLabel="👔 Estilo" title="El Ajuste es el Rey" body="Una camiseta de 15€ bien ajustada supera a cualquier pieza de lujo talla L." tag="ROPA" />
          <ConsejoCard cat="mente" catLabel="🧠 Mentalidad" title="El Proceso es el Resultado" body="Los mejores looksmaxers ejecutan el protocolo, documentan cada 30 días y confían en el proceso." tag="PSICOLOGÍA" />
        </div>
      </div>
    </ActivePage>
  );
}

const consejoCatColors: Record<string, string> = {
  nutricion: "text-[#4ec9b0]",
  estilo: "text-lm-gold",
  gym: "text-[#ce9178]",
  mente: "text-[#569cd6]",
  destacado: "text-lm-gold",
};

function ConsejoCard({
  cat,
  catLabel,
  title,
  body,
  tag,
}: {
  cat: string;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div className="rounded-xl border border-lm-border bg-lm-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-lm-border2">
      <div
        className={cn(
          "mb-1.5 text-[0.6rem] font-extrabold uppercase tracking-[1.5px]",
          consejoCatColors[cat] ?? "text-lm-text2",
        )}
      >
        {catLabel}
      </div>
      <h3 className="mb-1.5 text-[0.9rem] font-extrabold leading-snug">{title}</h3>
      <p className="font-serif text-[0.9rem] leading-normal text-lm-text2">{body}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-[0.58rem] font-bold text-lm-text2">
          {tag}
        </span>
      </div>
    </div>
  );
}

export function LexicoPage({ active }: { active: boolean }) {
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
    <ActivePage id="page-lexico" active={active}>
      <PageHeader
        title="📚 Léxico"
        desc="Términos esenciales del looksmaxing explicados en español"
      />
      <div className="mx-auto max-w-[900px] px-5 max-md:px-3">
        <div className="relative mb-5">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lm-text2">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar término..."
            id="lexicoInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full cursor-text rounded-[10px] border border-lm-border bg-lm-card py-3 pl-10 pr-4 font-sans text-[0.9rem] text-lm-text outline-none transition-colors duration-300 focus:border-lm-border2 max-md:min-h-11 max-md:text-base"
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
              <div className="font-display mb-0.5 text-[1.1rem] tracking-[1.5px] text-lm-gold">
                {l.term}
              </div>
              <div className="mb-2 text-[0.58rem] font-semibold uppercase tracking-[0.8px] text-lm-text2">
                {l.en}
              </div>
              <div className="font-serif text-[0.9rem] leading-normal text-lm-text2">{l.def}</div>
              <div
                className={cn(
                  "mt-2 inline-block rounded-full px-1.5 py-0.5 text-[0.55rem] font-extrabold uppercase tracking-[0.8px]",
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
