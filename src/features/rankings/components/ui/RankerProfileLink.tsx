import Link from "next/link";
import { profilePath, type NavPageId } from "@/features/app/routes";
import {
  isKnownRankerName,
  safeRankerLabel,
} from "@/features/rankings/lib/ranker-name";
import { profileTargetId } from "@/features/rankings/lib/profile-slug";
import { cn } from "@/lib/cn";
import { saveProfileReturnContext } from "@/features/app/profile-return-context";

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
  const target = profileTargetId(name);

  if (!isKnownRankerName(name)) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Link
      href={profilePath(name, from, target)}
      id={`profile-target-${target}`}
      data-profile-target={target}
      className={cn(
        className,
        "cursor-pointer rounded-sm underline-offset-2 transition-opacity",
        "lm-focus-ring hover:underline hover:opacity-90",
      )}
      title={`Ver perfil de ${label}`}
      onClick={() => {
        if (from) saveProfileReturnContext(from, target);
      }}
    >
      {label}
    </Link>
  );
}
