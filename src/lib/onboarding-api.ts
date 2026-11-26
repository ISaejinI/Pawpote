import { File } from 'expo-file-system'
import { Platform } from 'react-native'

import type { OnboardingPayload, OnboardingStatus, PhotoUpload } from '../../shared/onboarding'
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

/** Requête authentifiée vers l'API : GET sans corps, POST JSON sinon. */
async function apiRequest<T>(path: string, body?: object): Promise<T> {
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
    const response = await fetch(`${apiUrl}${path}`, {
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
export const getOnboardingStatus = () => apiRequest<OnboardingStatus>('/api/onboarding')

/** Enregistre en une fois le profil du propriétaire et tous ses chiens. */
export const saveOnboarding = (payload: OnboardingPayload) =>
  apiRequest<{ dogIds: string[] }>('/api/onboarding', payload)

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
}

/**
 * Envoie une photo locale au stockage Neon et renvoie sa clé.
 * L'API fournit une URL signée ; le fichier part ensuite directement vers le stockage.
 */
export async function uploadPhoto(uri: string) {
  // Le `fetch` global (expo/fetch) ne lit pas les URI `file://` : on passe par expo-file-system,
  // dont `File` sert aussi de corps de requête
  const file = new File(uri)
  if (!file.exists || !file.size) throw new Error(`Photo not found: ${uri}`)

  const extension = file.extension.replace('.', '').toLowerCase()
  const contentType = file.type.startsWith('image/') ? file.type : (MIME_TYPES[extension] ?? 'image/jpeg')

  const { key, uploadUrl } = await apiRequest<PhotoUpload>('/api/uploads/photos', {
    contentType,
    size: file.size,
  })

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  })
  if (!response.ok) throw new ApiError(response.status)
  return key
}

/** « JJ / MM / AAAA » → « AAAA-MM-JJ » (format des colonnes `date`). */
function toIsoDate(text: string) {
  const date = parseDateInput(text)
  if (!date) throw new Error(`Invalid date: ${text}`)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Photos d'un chien à envoyer, la principale en premier. */
export function dogPhotoUris(dog: DogDraft) {
  return [dog.mainPhoto, ...dog.extraPhotos].filter((uri): uri is string => !!uri)
}

/**
 * Prépare le brouillon pour l'API. Les étapes ont déjà validé chaque champ.
 * `photoKeys` associe l'URI locale de chaque photo à sa clé dans le stockage.
 */
export function toOnboardingPayload(
  dogs: DogDraft[],
  owner: OwnerDraft,
  photoKeys: Map<string, string>,
): OnboardingPayload {
  const keyOf = (uri: string) => {
    const key = photoKeys.get(uri)
    if (!key) throw new Error('Photo not uploaded')
    return key
  }

  return {
    owner: {
      birthDate: toIsoDate(owner.birthDate),
      address: owner.address.trim(),
      postalCode: owner.postalCode.trim(),
      city: owner.city.trim(),
      homeLocation: owner.homeLocation ?? null,
      photo: owner.photo ? keyOf(owner.photo) : null,
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
        photos: dogPhotoUris(dog).map(keyOf),
      }
    }),
  }
}
