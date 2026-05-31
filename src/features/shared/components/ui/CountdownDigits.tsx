import { cn } from "@/lib/cn";

type CountdownVariant = "gold" | "purple" | "green";

type CountdownDigitsProps = {
  h: string;
  m: string;
  s: string;
  variant?: CountdownVariant;
  className?: string;
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
      <div id={id} className={cn("cd-box", `cd-box--${variant}`)}>
        <span className={cn(`cd-text--${variant}`)}>{value}</span>
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
      <div className={cn(`cd-sep--${variant}`)}>:</div>
      <DigitUnit
        value={m}
        label="Min"
        variant={variant}
        id={variant === "gold" ? "cd-min" : undefined}
      />
      <div className={cn(`cd-sep--${variant}`)}>:</div>
      <DigitUnit
        value={s}
        label="Seg"
        variant={variant}
        id={variant === "gold" ? "cd-seg" : undefined}
      />
    </div>
  );
}
