import { Alert, Platform } from 'react-native'

import type { DiscoveryFeed, DogDetails, SwipeAction, SwipeResult } from '../../shared/discovery'
import { apiUrl } from './api-url'
import { authClient } from './auth-client'

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

export const getDiscoveryFeed = (signal: AbortSignal) => discoveryRequest<DiscoveryFeed>('', signal)
export const getDogDetails = (id: string, signal: AbortSignal) =>
  discoveryRequest<DogDetails>(`/dogs/${encodeURIComponent(id)}`, signal)
export const sendSwipe = (dogId: string, action: SwipeAction) =>
  discoveryRequest<SwipeResult>('/swipes', undefined, { dogId, action })
export const restartDiscovery = () => discoveryRequest('/restart', undefined, {})

export function announceMatches({ matches }: SwipeResult) {
  if (!matches.length) return
  Alert.alert('C’est un match !', matches.map(({ ownDog, targetDog }) =>
    `${ownDog} et ${targetDog} se sont trouvés !`,
  ).join('\n'))
}
