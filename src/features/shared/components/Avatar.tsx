"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { CreatorIcon } from "@/components/icons";
import { getRankerPhoto } from "@/features/rankings/data/avatars";
import { cn } from "@/lib/cn";

type AvatarProps = {
  name: string;
  size?: number;
  className?: string;
  rounded?: "full" | "md";
};

export function Avatar({
  name,
  size = 40,
  className = "",
  rounded = "full",
}: AvatarProps) {
  const src = getRankerPhoto(name);
  const [failed, setFailed] = useState(false);
  const radiusClass = rounded === "full" ? "rounded-full" : "rounded-xl";

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          radiusClass,
          className,
        )}
        style={{ width: size, height: size }}
      >
        <CreatorIcon name={name} size={Math.round(size * 0.55)} />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      sizes={`${size}px`}
      className={cn("shrink-0 object-cover", radiusClass, className)}
      onError={() => setFailed(true)}
    />
  );
}

export function ProfileAvatar({ name, photoBg }: { name: string; photoBg: string }) {
  const src = getRankerPhoto(name);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-[130px] w-[110px] items-center justify-center overflow-hidden",
        "rounded-[14px] border-2 border-lm-border2 bg-lm-card2",
        "max-md:h-[118px] max-md:w-[100px]",
      )}
      style={{ background: photoBg }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={name}
          width={110}
          height={130}
          sizes="130px"
          className="h-full w-full rounded-xl object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <CreatorIcon name={name} size={56} className="text-lm-gold" />
      )}
    </div>
  );
}

export type { StaticImageData as CreatorPhoto };
