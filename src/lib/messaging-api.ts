import { Platform } from 'react-native'

import { CHAT_PROTOCOL, type ChatMatch, type ChatMessage, type ChatThread, type WalkDraft } from '@shared/messaging'
import { API_TIMEOUT_MS, apiUrl } from './api-url'
import { authClient } from './auth-client'

async function request<T>(path = '', body?: object, signal?: AbortSignal): Promise<T> {
  const headers = new Headers()
  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie()
    if (cookie) headers.set('Cookie', cookie)
  }
  if (body) headers.set('Content-Type', 'application/json')
  const connection = new AbortController()
  const abort = () => connection.abort()
  signal?.addEventListener('abort', abort)
  if (signal?.aborted) abort()
  const timeout = setTimeout(abort, API_TIMEOUT_MS)
  try {
    const response = await fetch(`${apiUrl}/api/messaging${path}`, {
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
      method: body ? 'POST' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
      headers,
      signal: connection.signal,
    })
    if (!response.ok) throw new Error('Messaging request failed', { cause: response.status })
    return await response.json()
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export const getChatMatches = (signal: AbortSignal) => request<ChatMatch[]>('', undefined, signal)
export const getChatThread = (id: string, signal?: AbortSignal, before?: string) =>
  request<ChatThread>(`/${encodeURIComponent(id)}${before ? `?before=${encodeURIComponent(before)}` : ''}`, undefined, signal)

type OutgoingMessage = { id: string } & (
  | { kind: 'text'; body: string }
  | ({ kind: 'walk' } & WalkDraft)
)
export const sendChatMessage = (id: string, message: OutgoingMessage) =>
  request<ChatMessage>(`/${encodeURIComponent(id)}`, message)

export const respondToWalk = (id: string, messageId: string, response: { action: 'accept' } | ({ action: 'reschedule' } & WalkDraft)) =>
  request<{ saved: true }>(`/${encodeURIComponent(id)}/walks/${encodeURIComponent(messageId)}`, response)

export function watchChat(onChange: () => void) {
  let ws: WebSocket | undefined
  let retry: ReturnType<typeof setTimeout> | undefined
  let stopped = false
  let attempts = 0
  const ticketRequest = new AbortController()

  function reconnect() {
    if (!stopped) retry = setTimeout(() => { void connect() }, Math.min(1000 * 2 ** attempts++, 20_000))
  }

  async function connect() {
    try {
      const { ticket } = await request<{ ticket: string }>('/ticket', {}, ticketRequest.signal)
      if (stopped) return
      ws = new WebSocket(`${apiUrl.replace(/^http/, 'ws')}/api/messaging/live`, [CHAT_PROTOCOL, ticket])
      ws.onopen = () => {
        attempts = 0
        onChange()
      }
      ws.onmessage = ({ data }) => { if (data === 'refresh') onChange() }
      ws.onclose = reconnect
    } catch {
      reconnect()
    }
  }

  // Le serveur LAN reste utilisable par HTTP. Sur Neon, la relève couvre aussi les coupures du socket.
  if (apiUrl.startsWith('https://')) void connect()
  const fallback = setInterval(onChange, 12_000)

  return () => {
    stopped = true
    clearInterval(fallback)
    clearTimeout(retry)
    ticketRequest.abort()
    ws?.close()
  }
}
