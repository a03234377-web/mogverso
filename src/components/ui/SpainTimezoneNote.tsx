import { SPAIN_TIMEZONE_LABEL } from "@/lib/spain-time";
import { cn } from "@/lib/cn";

type SpainTimezoneNoteProps = {
  className?: string;
};

/** Aviso discreto de que las horas mostradas son peninsulares. */
export function SpainTimezoneNote({ className }: SpainTimezoneNoteProps) {
  return (
    <p className={cn("text-sm font-medium text-lm-text2", className)}>
      Todas las horas en {SPAIN_TIMEZONE_LABEL}.
    </p>
  );
}
