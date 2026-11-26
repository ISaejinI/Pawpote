import { Platform } from 'react-native'

import type { ProfileDog, ProfileSummary } from '../../shared/profile'
import { API_TIMEOUT_MS, apiUrl } from './api-url'
import { authClient } from './auth-client'

/** Mon prénom, ma photo et mes chiens, pour l'en-tête de l'onglet Profil. */
export async function getProfileSummary(signal: AbortSignal): Promise<ProfileSummary> {
  const headers = new Headers()
  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie()
    if (cookie) headers.set('Cookie', cookie)
  }

  // Abandonne aussi la requête au-delà du délai maximal de l'API
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort)
  const timeout = setTimeout(abort, API_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiUrl}/api/profile`, {
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
      headers,
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('Profile request failed', { cause: response.status })
    return await response.json()
  } finally {
    clearTimeout(timeout)
    signal.removeEventListener('abort', abort)
  }
}

/** « Berger australien · 3 ans », sans les informations manquantes. */
export function dogDetails({ breed, age }: Pick<ProfileDog, 'breed' | 'age'>) {
  const ageText = age === null ? null : age < 1 ? 'Moins d’un an' : `${age} an${age > 1 ? 's' : ''}`
  return [breed, ageText].filter(Boolean).join(' · ') || undefined
}
