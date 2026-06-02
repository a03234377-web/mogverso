/**
 * reCAPTCHA v3: en `next dev` no se usa (aunque copies la site key de producción).
 * En producción hace falta `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY`.
 */

export function getRecaptchaSiteKey(): string {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
}

function isDevelopmentEnv(): boolean {
  return process.env.NODE_ENV === "development";
}

/** El navegador debe obtener token antes de llamar a /api/vote/*. */
export function isClientRecaptchaRequired(): boolean {
  if (isDevelopmentEnv()) return false;
  return Boolean(getRecaptchaSiteKey());
}

/** El servidor omite siteverify (votos sin token). */
export function isServerRecaptchaSkipped(): boolean {
  return isDevelopmentEnv();
}
