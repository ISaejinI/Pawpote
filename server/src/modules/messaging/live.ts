import { createHmac, timingSafeEqual } from 'node:crypto'

import { upgradeWebSocket } from '@neon/functions'
import { sql } from 'drizzle-orm'
import type { Context } from 'hono'

import { CHAT_PROTOCOL } from '../../../../shared/messaging'
import { db } from '../../db'

const TICKET_TTL_MS = 60_000
const CONNECTION_TTL_MS = 5 * 60_000
const REFRESH_INTERVAL_MS = 3_000

type Subscriber = { socket: WebSocket; revision?: string; lastSent: number }
const subscribers = new Map<string, Set<Subscriber>>()
let timer: ReturnType<typeof setInterval> | undefined
let checking = false

function sign(payload: string) {
  return createHmac('sha256', process.env.BETTER_AUTH_SECRET!).update('pawpote-messaging:').update(payload)
    .digest('base64url')
}

export function issueMessagingTicket(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + TICKET_TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function ticketUser(ticket?: string) {
  if (!ticket || ticket.length > 1024) return null
  const [payload, signature, extra] = ticket.split('.')
  if (!payload || !signature || extra !== undefined) return null
  const actual = Buffer.from(signature)
  const expected = Buffer.from(sign(payload))
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const { userId, expiresAt } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (typeof userId === 'string' && typeof expiresAt === 'number' && expiresAt > Date.now()) return userId
  } catch {
    return null
  }
  return null
}

export async function chatRevisions(userIds: string[]) {
  const { rows } = await db.execute<{ userId: string; revision: string }>(sql`
    select clients.user_id as "userId", coalesce(md5(string_agg(
      match.id::text || ':' || match.chat_revision::text, ',' order by match.id
    )), '') as "revision"
    from unnest(${sql.param(userIds)}::text[]) clients(user_id)
    left join (
      select matches.id, matches.chat_revision, first.owner_id as owner1, second.owner_id as owner2
      from matches
      join dogs first on first.id = matches.dog_1_id
      join dogs second on second.id = matches.dog_2_id
    ) match on clients.user_id in (match.owner1, match.owner2)
    group by clients.user_id
  `)
  return rows
}

async function refreshSubscribers() {
  if (checking || !subscribers.size) return
  checking = true
  try {
    const rows = await chatRevisions([...subscribers.keys()])
    for (const { userId, revision } of rows) {
      for (const subscriber of subscribers.get(userId) ?? []) {
        const changed = revision !== subscriber.revision
        if (subscriber.socket.readyState !== 1 || (!changed && Date.now() - subscriber.lastSent < 24_000)) continue
        subscriber.socket.send(changed ? 'refresh' : 'ping')
        subscriber.revision = revision
        subscriber.lastSent = Date.now()
      }
    }
  } catch {
    console.error('Messaging live refresh failed')
  } finally {
    checking = false
  }
}

export function messagingLive(c: Context) {
  if (c.req.header('Upgrade')?.toLowerCase() !== 'websocket') return c.text('WebSocket requis.', 426)
  const protocols = c.req.header('Sec-WebSocket-Protocol')?.split(',').map((value) => value.trim())
  const userId = protocols?.[0] === CHAT_PROTOCOL ? ticketUser(protocols[1]) : null
  if (!userId) return c.text('Connexion requise.', 401)

  const { socket, response } = upgradeWebSocket(c.req.raw, { protocol: CHAT_PROTOCOL })
  const subscriber = { socket, lastSent: 0 }
  let expiry: ReturnType<typeof setTimeout> | undefined
  socket.addEventListener('open', () => {
    const active = subscribers.get(userId) ?? new Set<Subscriber>()
    active.add(subscriber)
    subscribers.set(userId, active)
    timer ??= setInterval(() => { void refreshSubscribers() }, REFRESH_INTERVAL_MS)
    expiry = setTimeout(() => socket.close(1000), CONNECTION_TTL_MS)
    void refreshSubscribers()
  })
  socket.addEventListener('close', () => {
    clearTimeout(expiry)
    const active = subscribers.get(userId)
    active?.delete(subscriber)
    if (!active?.size) subscribers.delete(userId)
    if (!subscribers.size) {
      clearInterval(timer)
      timer = undefined
    }
  })
  return response
}
