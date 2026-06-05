/** Rondas rotativas de la votación de ranking (verde). */
export const VOTE_ROUND_MS = 90 * 60 * 1000;

/** Votación de entrada al ranking (morado): una sola ronda con ganador final. */
export const ENTRY_VOTE_MS = 2 * 60 * 60 * 1000;

/** Cuánto tiempo se muestran subidas/bajadas tras una ronda de rank vote. */
export const MOVER_WINDOW_MS = VOTE_ROUND_MS;

/** Máximo de entradas en las pilas de movimientos (subidas / bajadas). */
export const MAX_MOVERS_STACK = 5;

/** Mínimo entre heals de rankvote (cliente). */
export const HEAL_RANKVOTE_COOLDOWN_MS = 60_000;

/** Mínimo entre heals de torneo (cliente). */
export const HEAL_TORNEO_COOLDOWN_MS = 60_000;

/** Backoff tras rate-limit en heal de torneo. */
export const HEAL_TORNEO_RATE_LIMIT_BACKOFF_MS = 45_000;

/** Poll de API de aura solo cuando RTDB no está disponible. */
export const AURA_API_FALLBACK_POLL_MS = 120_000;

/** Espera antes de activar fallback API si RTDB no hidrata. */
export const AURA_RTDB_HYDRATE_TIMEOUT_MS = 15_000;

/** Poll de heal torneo cuando la fase está expirada o esperando arranque. */
export const TORNEO_HEAL_POLL_MS = 15_000;
