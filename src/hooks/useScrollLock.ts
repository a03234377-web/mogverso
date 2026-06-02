"use client";

import { useLayoutEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

const BODY_PROPS = [
  "overflow",
  "position",
  "top",
  "left",
  "right",
  "width",
  "paddingRight",
  "overscrollBehavior",
] as const;

type BodyProp = (typeof BODY_PROPS)[number];
type BodyStyleSnapshot = Partial<Record<BodyProp, string>>;

let bodySnapshot: BodyStyleSnapshot = {};
let htmlOverflow = "";

function lockDocumentScroll() {
  if (typeof document === "undefined") return;

  lockCount += 1;
  if (lockCount > 1) return;

  savedScrollY = window.scrollY;
  const { body, documentElement: html } = document;

  bodySnapshot = {};
  for (const prop of BODY_PROPS) {
    bodySnapshot[prop] = body.style[prop];
  }
  htmlOverflow = html.style.overflow;

  const scrollbarWidth = window.innerWidth - html.clientWidth;

  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.paddingRight =
    scrollbarWidth > 0 ? `${scrollbarWidth}px` : (bodySnapshot.paddingRight ?? "");

  html.style.overflow = "hidden";
}

function unlockDocumentScroll() {
  if (typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const { body, documentElement: html } = document;

  for (const prop of BODY_PROPS) {
    body.style[prop] = bodySnapshot[prop] ?? "";
  }
  html.style.overflow = htmlOverflow;

  window.scrollTo(0, savedScrollY);
}

/** Bloquea el scroll del documento mientras un modal u overlay está activo. */
export function useScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    lockDocumentScroll();
    return () => unlockDocumentScroll();
  }, [active]);
}
