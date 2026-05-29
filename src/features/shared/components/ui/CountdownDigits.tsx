import { cn } from "@/lib/cn";

type CountdownVariant = "gold" | "purple" | "green";

type CountdownDigitsProps = {
  h: string;
  m: string;
  s: string;
  variant?: CountdownVariant;
  className?: string;
};

const numStyles: Record<CountdownVariant, string> = {
  gold: "font-display min-w-[55px] rounded-[10px] border border-lm-border bg-[rgba(232,184,75,0.08)] bg-[linear-gradient(180deg,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text px-2 py-0.5 text-center text-[clamp(1.8rem,5vw,4.5rem)] text-transparent max-md:min-w-[44px] max-md:text-[clamp(1.4rem,4vw,2.2rem)]",
  purple:
    "font-display min-w-[45px] rounded-lg border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.1)] px-2 py-0.5 text-center text-[clamp(1.4rem,4vw,2.5rem)] text-lm-purple",
  green:
    "font-display min-w-[44px] rounded-[7px] border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.1)] px-1.5 py-0.5 text-center text-[clamp(1.4rem,4vw,2.2rem)] text-lm-green2 max-md:text-[clamp(1.2rem,4vw,1.8rem)] max-md:min-w-[38px]",
};

const sepStyles: Record<CountdownVariant, string> = {
  gold: "mb-3 font-display text-[2rem] text-lm-gold opacity-40 animate-blink max-md:mb-2 max-md:text-[1.4rem]",
  purple: "mb-2.5 font-display text-2xl text-lm-purple opacity-50 animate-blink",
  green: "mb-2 font-display text-[1.3rem] text-lm-green2 opacity-50 animate-blink",
};

function DigitUnit({
  value,
  label,
  variant,
  id,
}: {
  value: string;
  label: string;
  variant: CountdownVariant;
  id?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div id={id} className={numStyles[variant]}>
        {value}
      </div>
      <div className="text-sm font-extrabold tracking-[1.5px] text-lm-text2 uppercase max-md:text-sm">
        {label}
      </div>
    </div>
  );
}

export function CountdownDigits({
  h,
  m,
  s,
  variant = "gold",
  className,
}: CountdownDigitsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      <DigitUnit
        value={h}
        label="Horas"
        variant={variant}
        id={variant === "gold" ? "cd-hora" : undefined}
      />
      <div className={sepStyles[variant]}>:</div>
      <DigitUnit
        value={m}
        label="Min"
        variant={variant}
        id={variant === "gold" ? "cd-min" : undefined}
      />
      <div className={sepStyles[variant]}>:</div>
      <DigitUnit
        value={s}
        label="Seg"
        variant={variant}
        id={variant === "gold" ? "cd-seg" : undefined}
      />
    </div>
  );
}
