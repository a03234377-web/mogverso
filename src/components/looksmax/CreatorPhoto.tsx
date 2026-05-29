"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { publicAsset } from "@/lib/asset-path";

type CreatorPhotoProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fallback?: ReactNode;
};

export function CreatorPhoto({
  src,
  alt,
  className,
  style,
  fallback = null,
}: CreatorPhotoProps) {
  const [failed, setFailed] = useState(false);
  const url = publicAsset(src);

  if (!url || failed) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
