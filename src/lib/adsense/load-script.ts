const SCRIPT_ID = "adsbygoogle-js";

let loadPromise: Promise<void> | null = null;

/** AdSense en producción; en dev solo si `NEXT_PUBLIC_ADSENSE_DEV=true` (evita ruido de consola). */
export function isAdSenseEnabled(clientId?: string): clientId is string {
  if (!clientId?.trim()) return false;
  if (process.env.NODE_ENV === "production") return true;
  return process.env.NEXT_PUBLIC_ADSENSE_DEV === "true";
}

/** Carga el script de AdSense una sola vez, bajo demanda (no en layout global). */
export function loadAdSenseScript(clientId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === "true") return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("AdSense script failed")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("AdSense script failed"));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

/** Ejecuta la tarea cuando el elemento entra (cerca del) viewport. */
export function whenNearViewport(
  element: Element,
  task: () => void,
  rootMargin = "400px",
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    task();
    return () => {};
  }

  let started = false;
  const observer = new IntersectionObserver(
    (entries) => {
      if (started) return;
      if (!entries.some((entry) => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      task();
    },
    { rootMargin },
  );

  observer.observe(element);
  return () => observer.disconnect();
}

/** Espera al idle del navegador antes de cargar scripts no críticos. */
export function whenIdle(task: () => void, timeoutMs = 2000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, Math.min(timeoutMs, 1500));
  return () => window.clearTimeout(id);
}
