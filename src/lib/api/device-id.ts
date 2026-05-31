"use client";

const STORAGE_KEY = "lm_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "dev_ssr";
  let id: string | null = null;
  try {
    id = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage bloqueado */
  }
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}
