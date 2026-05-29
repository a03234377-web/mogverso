import { RANKERS } from "@/data/rankers";
import { initFirebaseClient } from "@/lib/firebase/client";

function loadLegacyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-legacy="looksmax"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "/legacy/app-runtime.js";
    script.async = true;
    script.dataset.legacy = "looksmax";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar app-runtime.js"));
    document.body.appendChild(script);
  });
}

export async function bootstrapLooksMax(
  root: HTMLDivElement,
  legacyHtml: string,
): Promise<void> {
  window.RANKERS = RANKERS;
  root.innerHTML = legacyHtml;
  await loadLegacyScript();
  await initFirebaseClient();
}
