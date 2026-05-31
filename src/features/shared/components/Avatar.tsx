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
    <span
      className={cn("relative inline-block shrink-0 overflow-hidden", radiusClass, className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={name}
        fill
        sizes={`${size}px`}
        className={cn("object-cover object-top select-none", radiusClass)}
        draggable={false}
        onError={() => setFailed(true)}
      />
    </span>
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
          fill
          sizes="130px"
          className="rounded-xl object-cover object-top select-none"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <CreatorIcon name={name} size={56} className="text-lm-gold" />
      )}
    </div>
  );
}

export type { StaticImageData as CreatorPhoto };
