"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { RANKERS, type Ranker } from "@/data/rankers";
import {
  getFirebaseBridge,
  initFirebaseClient,
  subscribeAnnouncements,
  type Announcement,
  type FirebaseBridge,
} from "@/lib/firebase/client";

export type FirebaseContextValue = {
  fb: FirebaseBridge | null;
  ready: boolean;
  error: string | null;
  announcements: Announcement[];
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error("useFirebase debe usarse dentro de FirebaseProvider");
  }
  return ctx;
}

type FirebaseProviderProps = {
  children: ReactNode;
  rankers?: Ranker[];
};

export function FirebaseProvider({
  children,
  rankers = RANKERS,
}: FirebaseProviderProps) {
  const [fb, setFb] = useState<FirebaseBridge | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let unsubAnnouncements: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const ok = await initFirebaseClient(rankers);
        if (cancelled) return;

        if (!ok) {
          setError("Firebase no configurado");
          setReady(true);
          return;
        }

        const instance = getFirebaseBridge();
        setFb(instance);

        if (instance) {
          unsubAnnouncements = subscribeAnnouncements(
            instance.db,
            setAnnouncements,
          );
        }

        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al inicializar Firebase",
          );
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubAnnouncements?.();
    };
  }, [rankers]);

  return (
    <FirebaseContext.Provider
      value={{ fb, ready, error, announcements }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}
