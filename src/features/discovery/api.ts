import { Platform } from 'react-native'

import type {
  Coordinates, DiscoveryFeed, DiscoveryFilters, DogDetails, SwipeAction, SwipeResult,
} from '@shared/discovery'
import { apiUrl } from '@/lib/api-url'
import { authClient } from '@/lib/auth-client'

async function discoveryRequest<T>(path: string, signal?: AbortSignal, body?: object): Promise<T> {
  const headers = new Headers()
  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie()
    if (cookie) headers.set('Cookie', cookie)
  }
  if (body) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${apiUrl}/api/discovery${path}`, {
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
    method: body ? 'POST' : 'GET',
    body: body ? JSON.stringify(body) : undefined,
    headers,
    signal,
  })
  if (!response.ok) throw new Error('Discovery request failed', { cause: response.status })
  return response.json()
}

export function getDiscoveryFeed(filters: DiscoveryFilters, signal: AbortSignal) {
  const query = new URLSearchParams()
  if (filters.sizes.length) query.set('sizes', filters.sizes.join(','))
  if (filters.ages.length) query.set('ages', filters.ages.join(','))
  if (filters.sex) query.set('sex', filters.sex)
  if (filters.nearby) {
    query.set('nearby', '1')
    if (filters.radiusKm !== undefined) query.set('radiusKm', String(filters.radiusKm))
  }
  const search = query.toString()
  return discoveryRequest<DiscoveryFeed>(search ? `?${search}` : '', signal)
}

export const getDogDetails = (id: string, signal: AbortSignal, nearby = false) =>
  discoveryRequest<DogDetails>(`/dogs/${encodeURIComponent(id)}${nearby ? '?nearby=1' : ''}`, signal)
export const saveDiscoveryLocation = (position: Coordinates) =>
  discoveryRequest<{ saved: true }>('/location', undefined, position)
export const sendSwipe = (dogId: string, action: SwipeAction) =>
  discoveryRequest<SwipeResult>('/swipes', undefined, { dogId, action })
export const restartDiscovery = () => discoveryRequest('/restart', undefined, {})

const distanceFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

export function formatDiscoveryDistance(distanceKm?: number | null, approximate?: boolean) {
  if (distanceKm == null) return undefined
  if (approximate && distanceKm < 1) return 'moins de 1 km'
  return `${approximate ? 'environ ' : ''}${distanceFormatter.format(distanceKm)} km`
}
