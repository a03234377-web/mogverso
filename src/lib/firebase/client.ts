"use client";

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, ref, get, onValue, type Database } from "firebase/database";
import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";
import { getRankedNamesFromOverrides } from "@/lib/firebase/rank-overrides";
import { getDeviceId } from "@/lib/api/device-id";
import {
  firebaseConfig,
  initAppCheckIfConfigured,
  isFirebaseConfigured,
} from "./config";
import type { IconName } from "@/types/icons";

/** Cliente RTDB: solo lectura y listeners. Escrituras vía `/api/vote/*` y `/api/heal/*`. */
export type FirebaseBridge = {
  db: Database;
  ref: typeof ref;
  get: typeof get;
  onValue: typeof onValue;
  DEVICE_ID: string;
  getRankedNamesFromOverrides: (overrides: Record<string, number>) => string[];
};

export type Announcement = {
  type: string;
  text: string;
  icon: IconName;
  bg: string;
  border: string;
};

declare global {
  interface Window {
    FB?: FirebaseBridge;
    RANKERS?: Ranker[];
  }
}

let app: FirebaseApp | null = null;
let db: Database | null = null;
let bridge: FirebaseBridge | null = null;

export function getFirebaseBridge(): FirebaseBridge | null {
  return bridge;
}

const ANNOUNCEMENT_COLORS: Record<
  string,
  { bg: string; border: string; icon: IconName }
> = {
  info: {
    bg: "rgba(59,130,246,.16)",
    border: "rgba(59,130,246,.55)",
    icon: "info",
  },
  warning: {
    bg: "rgba(249,115,22,.16)",
    border: "rgba(249,115,22,.55)",
    icon: "alert-triangle",
  },
  success: {
    bg: "rgba(46,204,113,.14)",
    border: "rgba(46,204,113,.55)",
    icon: "trophy",
  },
  emergency: {
    bg: "rgba(255,71,87,.16)",
    border: "rgba(255,71,87,.65)",
    icon: "siren",
  },
};

function createGetRankedNamesFromOverrides(rankers: Ranker[]) {
  return (overrides: Record<string, number>) =>
    getRankedNamesFromOverrides(overrides, rankers);
}

function parseActiveAnnouncements(
  raw: Record<
    string,
    {
      active?: boolean;
      expiresAt?: number;
      ts?: number;
      type?: string;
      text?: string;
    }
  >,
): Announcement[] {
  const now = Date.now();
  return Object.values(raw)
    .filter((a) => a.active && (!a.expiresAt || a.expiresAt > now))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .map((ann) => {
      const c = ANNOUNCEMENT_COLORS[ann.type ?? ""] ?? ANNOUNCEMENT_COLORS.info;
      return {
        type: ann.type ?? "info",
        text: ann.text ?? "",
        icon: c.icon,
        bg: c.bg,
        border: c.border,
      };
    });
}

export function subscribeAnnouncements(
  database: Database,
  callback: (announcements: Announcement[]) => void,
): () => void {
  return onValue(ref(database, "announcements"), (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    callback(
      parseActiveAnnouncements(
        snap.val() as Parameters<typeof parseActiveAnnouncements>[0],
      ),
    );
  });
}

export async function initFirebaseClient(rankers?: Ranker[]): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    console.warn("[LooksMax] Firebase no configurado. Copia .env.example a .env.local");
    return false;
  }

  if (bridge) return true;

  const rankersList =
    rankers ?? (typeof window !== "undefined" ? window.RANKERS : undefined) ?? RANKERS;

  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    await initAppCheckIfConfigured(app);
  }

  if (!db) return false;

  const DEVICE_ID = getDeviceId();

  bridge = {
    db,
    ref,
    get,
    onValue,
    DEVICE_ID,
    getRankedNamesFromOverrides: createGetRankedNamesFromOverrides(rankersList),
  };

  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "development") {
      window.FB = bridge;
    }
    window.dispatchEvent(new Event("firebase-ready"));
  }

  return true;
}
