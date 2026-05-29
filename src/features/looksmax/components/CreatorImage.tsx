"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { publicAsset } from "@/lib/asset-path";
import { cn } from "@/lib/cn";

type CreatorImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fallback?: ReactNode;
};

/** Imagen de creador con URL normalizada y fallback si falla la carga. */
export function CreatorImage({
  src,
  alt,
  className,
  style,
  fallback = null,
}: CreatorImageProps) {
  const [failed, setFailed] = useState(false);
  const url = publicAsset(src);

  if (!url || failed) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn(className)}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
