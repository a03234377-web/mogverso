"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  adminTorneoGetState,
  adminTorneoPost,
  adminTorneoPreviewSeed,
  getStoredAdminSecret,
  setStoredAdminSecret,
} from "@/lib/api/admin-torneo";
import { healTorneoApi } from "@/lib/api/vote-client";
import { cn } from "@/lib/cn";
import type { TorneoState } from "@/types/looksmax";

type LogEntry = { ok: boolean; message: string; at: number };

const CHECKLIST = [
  "Coming soon + calendario + countdown miércoles 22:30",
  "Octavos: 8 duelos, votar todos, rechazar doble voto",
  "Fast-forward → cuartos con ganadores 1v2, 3v4…",
  "Semis y final",
  "Rate limit / API fase activa",
  "Modal promo: 5 s antes de cerrar",
  "Noticias coherentes",
] as const;

function ActionButton({
  children,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-left text-sm font-bold lm-focus-ring",
        variant === "danger"
          ? "border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
          : "border-lm-border bg-lm-card text-lm-text hover:border-lm-gold/40",
      )}
    >
      {children}
    </button>
  );
}

export function AdminTorneoPanel() {
  const [secretInput, setSecretInput] = useState("");
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<TorneoState | null>(null);
  const [seedPreview, setSeedPreview] = useState<{
    seed: string[];
    pairings: { id: string; p1: string; p2: string }[];
  } | null>(null);
  const [log, setLog] = useState<LogEntry | null>(null);
  const [busy, setBusy] = useState(false);

  const pushLog = useCallback((ok: boolean, message: string) => {
    setLog({ ok, message, at: Date.now() });
  }, []);

  const run = useCallback(
    async (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
      if (!secret) {
        pushLog(false, "Guarda ADMIN_SECRET primero");
        return;
      }
      setBusy(true);
      try {
        const result = await fn();
        pushLog(result.ok, result.ok ? `${label}: OK` : `${label}: ${result.error}`);
        if (result.ok) {
          const st = await adminTorneoGetState(secret);
          if (st.ok && st.data?.state) {
            setState(st.data.state as TorneoState);
          }
        }
      } finally {
        setBusy(false);
      }
    },
    [secret, pushLog],
  );

  const saveSecret = useCallback(() => {
    setStoredAdminSecret(secretInput);
    setSecret(secretInput.trim());
    pushLog(true, "Secreto guardado en sessionStorage");
  }, [secretInput, pushLog]);

  const loadState = useCallback(() => {
    void run("Estado", async () => {
      const res = await adminTorneoGetState(secret);
      if (res.ok && res.data) {
        setState(res.data.state as TorneoState);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    });
  }, [run, secret]);

  const loadSeed = useCallback(() => {
    void run("Preview seed", async () => {
      const res = await adminTorneoPreviewSeed(secret);
      if (res.ok && res.data) {
        setSeedPreview(res.data);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    });
  }, [run, secret]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div
        className={cn(
          "mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3",
          "text-sm font-semibold text-amber-100",
        )}
      >
        Solo desarrollo / staging. No enlaces públicos a esta página.
      </div>

      <h1 className="mb-2 font-display text-2xl font-bold text-lm-gold">
        Admin · Torneo
      </h1>
      <p className="mb-6 text-sm text-lm-text2">
        Prueba fases sin esperar 24 h.{" "}
        <Link href="/torneo" className="text-lm-gold underline" target="_blank">
          Abrir /torneo
        </Link>
      </p>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          placeholder="ADMIN_SECRET"
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
          className={cn(
            "min-h-11 flex-1 rounded-lg border border-lm-border bg-lm-bg2 px-3",
            "text-sm text-lm-text",
          )}
        />
        <button
          type="button"
          onClick={saveSecret}
          className="rounded-lg bg-lm-gold px-4 py-2 text-sm font-bold text-lm-bg"
        >
          Guardar secreto
        </button>
        <button
          type="button"
          onClick={() => {
            const s = getStoredAdminSecret();
            if (s) {
              setSecret(s);
              setSecretInput(s);
            }
          }}
          className="rounded-lg border border-lm-border px-4 py-2 text-sm font-bold text-lm-text2"
        >
          Recuperar
        </button>
      </div>

      {log && (
        <p
          className={cn(
            "mb-4 rounded-lg px-3 py-2 text-sm font-semibold",
            log.ok ? "bg-green-500/15 text-green-200" : "bg-red-500/15 text-red-200",
          )}
        >
          {log.message}
        </p>
      )}

      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        <ActionButton onClick={loadState} variant="default">
          Refrescar estado
        </ActionButton>
        <ActionButton onClick={loadSeed}>Preview top 16</ActionButton>
        <ActionButton
          onClick={() =>
            run("Heal", async () => {
              await healTorneoApi();
              return { ok: true };
            })
          }
        >
          Heal (público)
        </ActionButton>
        <ActionButton
          onClick={() =>
            run("Fast-forward", () =>
              adminTorneoPost(secret, "/api/admin/torneo/fast-forward"),
            )
          }
        >
          Fast-forward fase
        </ActionButton>
        <ActionButton
          onClick={() =>
            run("Advance", () => adminTorneoPost(secret, "/api/admin/torneo/advance"))
          }
        >
          Avanzar 1 fase
        </ActionButton>
        <ActionButton
          onClick={() =>
            run("Start octavos", () =>
              adminTorneoPost(secret, "/api/admin/torneo/start-now"),
            )
          }
        >
          Iniciar octavos ahora
        </ActionButton>
        <ActionButton
          onClick={() =>
            run("Reset waiting", () =>
              adminTorneoPost(secret, "/api/admin/torneo/reset"),
            )
          }
        >
          Reset → waiting
        </ActionButton>
        <ActionButton
          onClick={() =>
            run("Clear votes", () =>
              adminTorneoPost(secret, "/api/admin/torneo/clear-votes"),
            )
          }
          variant="danger"
        >
          Borrar torneoVotes
        </ActionButton>
      </div>

      {busy && <p className="mb-4 text-sm text-lm-text2">Ejecutando…</p>}

      {state && (
        <pre
          className={cn(
            "mb-6 max-h-64 overflow-auto rounded-xl border border-lm-border",
            "bg-lm-bg2 p-3 text-xs text-lm-text2",
          )}
        >
          {JSON.stringify(
            {
              phase: state.phase,
              phaseEnd: state.phaseEnd,
              seedNames: state.seedNames,
              editionStartMs: state.editionStartMs,
            },
            null,
            2,
          )}
        </pre>
      )}

      {seedPreview && (
        <div className="mb-6 rounded-xl border border-lm-border bg-lm-card p-4">
          <h2 className="mb-2 text-sm font-bold text-lm-gold">Top 16 → octavos</h2>
          <ol className="list-decimal pl-5 text-sm text-lm-text2">
            {seedPreview.seed.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ol>
          <ul className="mt-3 list-none space-y-1 p-0 text-sm">
            {seedPreview.pairings.map((p) => (
              <li key={p.id}>
                {p.id}: {p.p1} vs {p.p2}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-lm-border bg-lm-card p-4">
        <h2 className="mb-3 text-sm font-bold text-lm-text">Checklist QA</h2>
        <ul className="list-none space-y-2 p-0 text-sm text-lm-text2">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-lm-gold">□</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
