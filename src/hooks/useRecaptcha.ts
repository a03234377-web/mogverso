"use client";

import { useCallback, useState } from "react";
import {
  getRecaptchaSiteKey,
  isClientRecaptchaRequired,
} from "@/lib/security/recaptcha-config";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ID = "recaptcha-v3-script";
const siteKey = getRecaptchaSiteKey();

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!siteKey) return Promise.resolve();
  if (document.getElementById(SCRIPT_ID)) {
    return new Promise((resolve) => {
      window.grecaptcha?.ready(() => resolve());
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = () => {
      window.grecaptcha?.ready(() => resolve());
    };
    script.onerror = () => reject(new Error("reCAPTCHA script failed"));
    document.head.appendChild(script);
  });
}

let recaptchaLoadPromise: Promise<void> | null = null;

function ensureRecaptchaLoaded(): Promise<void> {
  if (!siteKey || !isClientRecaptchaRequired()) return Promise.resolve();
  if (!recaptchaLoadPromise) {
    recaptchaLoadPromise = loadRecaptchaScript().catch((err) => {
      recaptchaLoadPromise = null;
      throw err;
    });
  }
  return recaptchaLoadPromise;
}

export function useRecaptcha(action = "vote") {
  const required = isClientRecaptchaRequired();
  const [ready, setReady] = useState(!required);

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!required) return undefined;
    try {
      await ensureRecaptchaLoaded();
      setReady(true);
      if (!window.grecaptcha) return undefined;
      return window.grecaptcha.execute(siteKey, { action });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[useRecaptcha] no se pudo obtener token:", err);
      }
      setReady(false);
      return undefined;
    }
  }, [action, required]);

  return { ready, getToken, enabled: required };
}
