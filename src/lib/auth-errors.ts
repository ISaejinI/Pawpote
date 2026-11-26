type AuthError = { code?: string; message?: string } | null | undefined;

/** Messages en français pour les codes d'erreur Better Auth les plus courants. */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou mot de passe incorrect.',
  INVALID_EMAIL: 'Cette adresse e-mail n’est pas valide.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse e-mail.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Un compte existe déjà avec cette adresse e-mail.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  PASSWORD_TOO_LONG: 'Le mot de passe est trop long.',
  INVALID_PASSWORD: 'Mot de passe actuel incorrect.',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Ce compte n’a pas de mot de passe.',
};

export function getAuthErrorMessage(error: AuthError, fallback: string) {
  if (error?.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return fallback;
}

/** Vérification simple côté app ; le serveur reste la référence. */
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
