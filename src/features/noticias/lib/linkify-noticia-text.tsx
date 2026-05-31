"use client";

import type { ReactNode } from "react";
import { RankerProfileLink } from "@/features/rankings/components/ui/RankerProfileLink";
import { cn } from "@/lib/cn";

function findEarliestName(
  text: string,
  names: string[],
): { index: number; name: string } | null {
  let match: { index: number; name: string } | null = null;

  for (const name of names) {
    const index = text.indexOf(name);
    if (index === -1) continue;
    if (!match || index < match.index) {
      match = { index, name };
    }
  }

  return match;
}

function linkifyNoticiaText(
  text: string,
  names: string[],
  linkClassName?: string,
  keyPrefix = "link",
): ReactNode[] {
  const match = findEarliestName(text, names);
  if (!match) return [text];

  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match.name.length);

  return [
    ...(before ? [before] : []),
    <RankerProfileLink
      key={`${keyPrefix}-${match.name}-${match.index}`}
      name={match.name}
      from="noticias"
      className={linkClassName}
    />,
    ...linkifyNoticiaText(after, names, linkClassName, keyPrefix),
  ];
}

export function NoticiaTextWithProfiles({
  text,
  profileNames,
  className,
  linkClassName,
}: {
  text: string;
  profileNames: string[];
  className?: string;
  linkClassName?: string;
}) {
  const uniqueNames = [...new Set(profileNames.filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );

  if (uniqueNames.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {linkifyNoticiaText(text, uniqueNames, cn("text-inherit", linkClassName))}
    </span>
  );
}
