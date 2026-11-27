import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import type { OnboardingDog } from '@shared/onboarding'
import type {
  DogRemoval, DogSheet, DogUpdate, NewDog, OwnerAddressUpdate, OwnerIdentityUpdate, OwnerInfo,
  ProfileDog, ProfileSummary,
} from '@shared/profile'
import { API_TIMEOUT_MS, apiUrl } from './api-url'
import { authClient } from './auth-client'

/** Réponse en erreur de l'API, avec son code HTTP. */
export class ProfileApiError extends Error {
  constructor(readonly status: number) {
    super(`Profile request failed (${status})`)
  }
}

/** Requête authentifiée vers `/api/profile` : GET sans corps, POST JSON sinon. */
async function profileRequest<T>(path: string, { body, signal }: { body?: object; signal?: AbortSignal } = {}) {
  const headers = new Headers()
  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie()
    if (cookie) headers.set('Cookie', cookie)
  }
  if (body) headers.set('Content-Type', 'application/json')

  // Abandonne aussi la requête au-delà du délai maximal de l'API
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort)
  const timeout = setTimeout(abort, API_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiUrl}/api/profile${path}`, {
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
      method: body ? 'POST' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
      headers,
      signal: controller.signal,
    })
    if (!response.ok) throw new ProfileApiError(response.status)
    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

/** Mon prénom, ma photo et mes chiens, pour l'onglet Profil. */
export const getProfileSummary = (signal?: AbortSignal) =>
  profileRequest<ProfileSummary>('', { signal })

/** La fiche complète d'un de mes chiens. */
export const getDogSheet = (id: string, signal?: AbortSignal) =>
  profileRequest<DogSheet>(`/dogs/${encodeURIComponent(id)}`, { signal })

/** Enregistre la fiche modifiée d'un de mes chiens. */
export const saveDogSheet = (id: string, update: DogUpdate) =>
  profileRequest<{ ok: true }>(`/dogs/${encodeURIComponent(id)}`, { body: update })

/** Ajoute un chien à mon compte (mêmes informations que l'onboarding, étapes 1 à 4). */
export const addDog = (dog: OnboardingDog) => profileRequest<NewDog>('/dogs', { body: dog })

/** Retire un chien de mon compte et indique combien il en reste. */
export const removeDog = (id: string) =>
  profileRequest<DogRemoval>(`/dogs/${encodeURIComponent(id)}/delete`, { body: {} })

/** Mes informations personnelles et mon adresse. */
export const getOwnerInfo = (signal?: AbortSignal) => profileRequest<OwnerInfo>('/owner', { signal })

/** Enregistre mon prénom, mon nom, ma date de naissance et ma photo. */
export const saveOwnerIdentity = (identity: OwnerIdentityUpdate) =>
  profileRequest<{ ok: true }>('/owner/identity', { body: identity })

/** Enregistre mon adresse. */
export const saveOwnerAddress = (address: OwnerAddressUpdate) =>
  profileRequest<{ ok: true }>('/owner/address', { body: address })

/** Charge mes informations une fois, avec de quoi réessayer en cas d'échec. */
export function useOwnerInfo() {
  const [data, setData] = useState<OwnerInfo>()
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getOwnerInfo(controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) setData(result)
      },
      () => {
        if (!controller.signal.aborted) setError(true)
      },
    )
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setError(false)
    setAttempt((current) => current + 1)
  }, [])

  return { data, error, retry }
}

/**
 * Charge le profil et le recharge à chaque retour sur l'écran (après une fiche modifiée).
 * Les données affichées restent en place pendant le rechargement.
 */
export function useProfileSummary() {
  const [data, setData] = useState<ProfileSummary>()
  const [error, setError] = useState<unknown>()
  const controllerRef = useRef<AbortController | null>(null)

  const load = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setError(undefined)

    getProfileSummary(controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) setData(result)
      },
      (cause: unknown) => {
        if (!controller.signal.aborted) setError(cause)
      },
    )
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
      return () => controllerRef.current?.abort()
    }, [load]),
  )

  return { data, error, retry: load }
}

/** « Berger australien · 3 ans », sans les informations manquantes. */
export function dogDetails({ breed, age }: Pick<ProfileDog, 'breed' | 'age'>) {
  const ageText = age === null ? null : age < 1 ? 'Moins d’un an' : `${age} an${age > 1 ? 's' : ''}`
  return [breed, ageText].filter(Boolean).join(' · ') || undefined
}
