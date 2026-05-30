/** Rondas rotativas de la votación de ranking (verde). */
export const VOTE_ROUND_MS = 3 * 60 * 60 * 1000;
export const VOTE_ROUND_HOURS = 3;

/** Votación de entrada al ranking (morado): una sola ronda con ganador final. */
export const ENTRY_VOTE_MS = 2 * 60 * 60 * 1000;
export const ENTRY_VOTE_HOURS = 2;

/** Cuánto tiempo se muestran subidas/bajadas tras una ronda de rank vote. */
export const MOVER_WINDOW_MS = VOTE_ROUND_MS;

/** Máximo de entradas en las pilas de movimientos (subidas / bajadas). */
export const MAX_MOVERS_STACK = 5;
