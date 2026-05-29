const SCRIPT_ID = "adsbygoogle-js";

let loadPromise: Promise<void> | null = null;

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
    script.crossOrigin = "anonymous";
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

/** Espera al idle del navegador antes de cargar scripts no críticos. */
export function whenIdle(task: () => void, timeoutMs = 2000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, Math.min(timeoutMs, 1500));
  return () => window.clearTimeout(id);
}
