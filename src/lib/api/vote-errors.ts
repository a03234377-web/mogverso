const VOTE_ERROR_MESSAGES: Record<string, string> = {
  server_not_configured:
    "El servidor de votos no está configurado. Falta FIREBASE_SERVICE_ACCOUNT_JSON en el entorno.",
  rate_limit: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  missing_recaptcha: "No se pudo verificar reCAPTCHA. Recarga la página e inténtalo otra vez.",
  recaptcha_not_configured:
    "reCAPTCHA no está configurado en el servidor (RECAPTCHA_SECRET_KEY).",
  recaptcha_verify_failed: "Error al verificar reCAPTCHA. Inténtalo de nuevo.",
  recaptcha_invalid: "reCAPTCHA rechazó la petición. Recarga e inténtalo otra vez.",
  recaptcha_low_score: "Actividad sospechosa detectada. Inténtalo más tarde.",
  already_voted: "Ya has votado en esta ronda (1 voto por dispositivo e IP).",
  expired: "Esta ronda ha terminado. Se cargará una nueva votación en breve.",
  resolved: "Esta ronda ya se resolvió. Espera la siguiente.",
  no_round: "No hay votación activa. Recarga la página.",
  invalid_candidate: "Candidato no válido para esta ronda.",
  transaction_failed: "No se pudo registrar el voto. Inténtalo de nuevo.",
  vote_failed: "No se pudo registrar el voto. Inténtalo de nuevo.",
  heal_failed: "No se pudo sanear la ronda de votación.",
};

export function formatVoteError(reason: string | undefined): string {
  if (!reason) return VOTE_ERROR_MESSAGES.vote_failed;
  if (VOTE_ERROR_MESSAGES[reason]) return VOTE_ERROR_MESSAGES[reason];
  if (/PERMISSION_DENIED|permission_denied/i.test(reason)) {
    return "Firebase denegó la lectura. Revisa las reglas RTDB en la consola del proyecto.";
  }
  return reason;
}

export function formatHealError(err: unknown): string {
  if (typeof err === "string") return formatVoteError(err);
  const msg = err instanceof Error ? err.message : String(err);
  if (/PERMISSION_DENIED|permission_denied/i.test(msg)) {
    return "Firebase denegó la escritura. Revisa las reglas RTDB en la consola del proyecto.";
  }
  return formatVoteError(msg) || "No se pudo sanear la ronda";
}

export function isBackendUnavailableReason(reason: string | undefined): boolean {
  return reason === "server_not_configured";
}
