import { creatorImage } from "@/assets/creators";
import { IconLabel } from "@/components/icons";
import { CompareSide } from "./CompareSide";
import { cn } from "@/lib/cn";

export function BreakingNewsCard() {
  return (
    <div
      className={cn(
        "relative mb-6 animate-breaking-pulse overflow-hidden rounded-[14px]",
        "border border-[rgba(255,71,87,0.35)]",
        "bg-[linear-gradient(135deg,rgba(192,57,43,0.15),rgba(255,71,87,0.08))]",
        "p-5 max-md:rounded-xl max-md:p-4",
      )}
    >
      <div className="mb-2 flex items-center gap-1.5 lm-type-label text-lm-red2">
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-red2" />
        <IconLabel icon="siren" iconSize={12}>
          BREAKING NEWS
        </IconLabel>
      </div>
      <div
        className={cn(
          "font-sans text-[clamp(1.15rem,2.5vw,1.75rem)] leading-snug font-bold tracking-tight text-lm-text",
          "max-md:text-[clamp(1.05rem,4.5vw,1.35rem)]",
        )}
      >
        KAPPAH: DE SUB-HUMAN A CHAD ABSOLUTO — LA TRANSFORMACIÓN QUE PARTIÓ EL FORO EN
        DOS
      </div>
      <div className="mt-2.5 text-base leading-normal font-semibold text-lm-text2">
        La operación estética más comentada de la comunidad española.{" "}
        <span className="text-lm-red2">
          Kappah pasó de ser clasificado sub-3 a coronarse #1 del ranking con un score
          de 9.4.
        </span>{" "}
        · Hace 1 hora
      </div>
      <div className="mt-3 font-serif text-base leading-relaxed text-lm-text2 max-md:text-base">
        Kappah era el ejemplo que todos ponían de lo que no se debía ser. Sub-human en
        todos los foros, cara plana, estructura nula. Entonces llegó la operación.
        Mandíbula, mentón, rinoplastia. Hoy es el #1 indiscutible y el caso de estudio
        más citado de la historia del looksmaxing español.
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 max-md:flex-col max-md:gap-3">
        <CompareSide
          label="Antes"
          labelClass="before"
          img={creatorImage("kappahsub.webp")}
          score="Sub-3"
          scoreClass="bad"
        />
        <div className="font-sans text-3xl font-bold text-lm-gold opacity-60 max-md:rotate-90 max-md:text-2xl">
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
  );
}
