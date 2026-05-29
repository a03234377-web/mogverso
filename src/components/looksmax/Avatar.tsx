"use client";

import { useState } from "react";
import { FALLBACK, FOTOS } from "@/data/avatars";

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
  const src = FOTOS[name];
  const fb = FALLBACK[name] ?? "👤";
  const [failed, setFailed] = useState(false);
  const radius = rounded === "full" ? "50%" : "12px";

  if (!src || failed) {
    return (
      <span
        className={className}
        style={{
          fontSize: size * 0.55,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {fb}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius }}
      onError={() => setFailed(true)}
    />
  );
}

export function ProfileAvatar({ name, photoBg }: { name: string; photoBg: string }) {
  const src = FOTOS[name];
  const fb = FALLBACK[name] ?? "👤";
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="flex h-[130px] w-[110px] items-center justify-center overflow-hidden rounded-[14px] border-2 border-lm-border2 bg-lm-card2 max-md:h-[118px] max-md:w-[100px]"
      style={{ background: photoBg }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-xl object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="text-[4rem]">{fb}</div>
      )}
    </div>
  );
}
