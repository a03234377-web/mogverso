"use client";

import Image, { type StaticImageData } from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CreatorImageProps = {
  src: StaticImageData;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fallback?: ReactNode;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

/** Imagen de creador optimizada con next/image. */
export function CreatorImage({
  src,
  alt,
  className,
  style,
  fallback = null,
  fill = true,
  sizes = "(max-width: 768px) 50vw, 280px",
  priority,
}: CreatorImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return fallback ? <>{fallback}</> : null;
  }

  if (fill) {
    return (
      <span className="relative block h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(className)}
          style={style}
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={src.width}
      height={src.height}
      priority={priority}
      className={cn(className)}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
