const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim()

if (!configuredUrl) throw new Error('EXPO_PUBLIC_API_URL is not configured')

export const apiUrl = configuredUrl.replace(/\/+$/, '')

/**
 * Délai maximal d'une requête à l'API (ms). Au-delà, elle est abandonnée :
 * l'app ne reste pas bloquée sur l'écran de démarrage si l'API est injoignable.
 */
export const API_TIMEOUT_MS = 10_000
