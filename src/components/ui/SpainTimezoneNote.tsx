import { SPAIN_TIMEZONE_DETAIL, SPAIN_TIMEZONE_LABEL } from "@/lib/spain-time";
import { cn } from "@/lib/cn";

type SpainTimezoneNoteProps = {
  className?: string;
};

/** Aviso de que las horas mostradas son las de España. */
export function SpainTimezoneNote({ className }: SpainTimezoneNoteProps) {
  return (
    <p className={cn("text-sm font-medium text-lm-text2", className)}>
      Todas las horas en{" "}
      <span className="font-bold text-lm-text">{SPAIN_TIMEZONE_LABEL}</span> (
      {SPAIN_TIMEZONE_DETAIL}).
    </p>
  );
}
