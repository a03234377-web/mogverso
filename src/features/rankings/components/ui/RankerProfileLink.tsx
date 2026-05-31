import Link from "next/link";
import { profilePath, type NavPageId } from "@/features/app/routes";
import {
  isKnownRankerName,
  safeRankerLabel,
} from "@/features/rankings/lib/ranker-name";
import { cn } from "@/lib/cn";

type RankerProfileLinkProps = {
  name: string;
  className?: string;
  /** Sección de origen para el botón «Volver» del perfil. */
  from?: NavPageId;
  fallback?: string;
};

export function RankerProfileLink({
  name,
  className,
  from,
  fallback = "—",
}: RankerProfileLinkProps) {
  const label = safeRankerLabel(name, fallback);

  if (!isKnownRankerName(name)) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Link
      href={profilePath(name, from)}
      className={cn(
        className,
        "cursor-pointer rounded-sm underline-offset-2 transition-opacity",
        "lm-focus-ring hover:underline hover:opacity-90",
      )}
      title={`Ver perfil de ${label}`}
    >
      {label}
    </Link>
  );
}
