import { Platform } from 'react-native'

import type { OnboardingPayload, OnboardingStatus } from '../../shared/onboarding'
import { API_TIMEOUT_MS, apiUrl } from './api-url'
import { authClient } from './auth-client'
import { parseDateInput } from './dates'
import type { DogDraft, OwnerDraft } from './onboarding-draft'

/** Réponse en erreur de l'API, avec son code HTTP. */
export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API request failed (${status})`)
  }
}

async function onboardingRequest<T>(body?: OnboardingPayload): Promise<T> {
  const headers = new Headers()
  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie()
    if (cookie) headers.set('Cookie', cookie)
  }
  if (body) headers.set('Content-Type', 'application/json')

  // Même délai maximal que les requêtes d'authentification
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiUrl}/api/onboarding`, {
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
      method: body ? 'POST' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
      headers,
      signal: controller.signal,
    })
    if (!response.ok) throw new ApiError(response.status)
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

/** Indique si l'utilisateur connecté a déjà terminé l'onboarding (au moins un chien en base). */
export const getOnboardingStatus = () => onboardingRequest<OnboardingStatus>()

/** Enregistre en une fois le profil du propriétaire et tous ses chiens. */
export const saveOnboarding = (payload: OnboardingPayload) =>
  onboardingRequest<{ dogIds: string[] }>(payload)

/** « JJ / MM / AAAA » → « AAAA-MM-JJ » (format des colonnes `date`). */
function toIsoDate(text: string) {
  const date = parseDateInput(text)
  if (!date) throw new Error(`Invalid date: ${text}`)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Prépare le brouillon pour l'API. Les étapes ont déjà validé chaque champ. */
export function toOnboardingPayload(dogs: DogDraft[], owner: OwnerDraft): OnboardingPayload {
  return {
    owner: {
      birthDate: toIsoDate(owner.birthDate),
      address: owner.address.trim(),
      postalCode: owner.postalCode.trim(),
      city: owner.city.trim(),
    },
    dogs: dogs.map((dog) => {
      if (!dog.sex) throw new Error('Missing dog sex')
      return {
        name: dog.name.trim(),
        sex: dog.sex,
        birthDate: toIsoDate(dog.birthDate),
        breedId: dog.breed?.id ?? null,
        traits: dog.traits,
        quirk: dog.quirk.trim(),
        favoriteToy: dog.favoriteToy.trim() || null,
        activities: dog.activities,
        description: dog.description.trim(),
      }
    }),
  }
}
