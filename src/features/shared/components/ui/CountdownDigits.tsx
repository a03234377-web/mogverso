import { cn } from "@/lib/cn";

type CountdownVariant = "gold" | "purple" | "green";

type CountdownDigitsProps = {
  h: string;
  m: string;
  s: string;
  variant?: CountdownVariant;
  className?: string;
};

const numBoxBase = "font-sans tabular-nums px-2 py-0.5 text-center";

const numBoxStyles: Record<CountdownVariant, string> = {
  gold: cn(
    numBoxBase,
    "min-w-[55px] rounded-[10px] border border-lm-border bg-[rgba(232,184,75,0.08)] max-md:min-w-[44px]",
  ),
  purple: cn(
    numBoxBase,
    "min-w-[45px] rounded-lg border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.1)] max-md:min-w-[38px]",
  ),
  green: cn(
    numBoxBase,
    "min-w-[44px] rounded-[7px] border px-1.5 max-md:min-w-[38px]",
    "border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.1)]",
  ),
};

const numTextStyles: Record<CountdownVariant, string> = {
  gold: cn(
    "bg-clip-text font-bold text-transparent",
    "bg-[linear-gradient(180deg,var(--color-lm-gold2),var(--color-lm-gold))]",
    "text-[clamp(1.6rem,4.5vw,3.5rem)] max-md:text-[clamp(1.35rem,4vw,2rem)]",
  ),
  purple:
    "text-[clamp(1.35rem,4vw,2.25rem)] font-bold text-lm-purple max-md:text-[clamp(1.15rem,4vw,1.75rem)]",
  green:
    "text-[clamp(1.25rem,4vw,2rem)] font-bold text-lm-green2 max-md:text-[clamp(1.1rem,4vw,1.65rem)]",
};

const sepStyles: Record<CountdownVariant, string> = {
  gold: "mb-3 font-sans text-2xl font-bold text-lm-gold opacity-40 animate-blink max-md:mb-2 max-md:text-xl",
  purple: "mb-2.5 font-sans text-xl font-bold text-lm-purple opacity-50 animate-blink",
  green: "mb-2 font-sans text-lg font-bold text-lm-green2 opacity-50 animate-blink",
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
      <div id={id} className={numBoxStyles[variant]}>
        <span className={numTextStyles[variant]}>{value}</span>
      </div>
      <div className="lm-type-label text-lm-text2 max-md:text-sm">{label}</div>
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
