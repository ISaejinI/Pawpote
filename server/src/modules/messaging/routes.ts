import { and, desc, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'

import {
  MAX_MESSAGE_LENGTH, MAX_WALK_PLACE_LENGTH,
  type ChatMatch, type ChatMessage, type ChatThread,
} from '../../../../shared/messaging'
import { db } from '../../db'
import { matches, messages } from '../../db/schema'
import { issueMessagingTicket } from './live'
import { requireSession, sessionCors, type SessionVariables } from '../auth/session'

const messaging = new Hono<{ Variables: SessionVariables }>()
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
const PAGE_SIZE = 50

messaging.use('*', sessionCors)
messaging.use('*', requireSession)

async function listMatches(userId: string, matchId?: string) {
  const response = await db.execute<ChatMatch>(sql`
    select match.id,
      case when first.owner_id = ${userId} then first.name else second.name end as "ownDog",
      other.name as "dogName", profile.first_name as "ownerName",
      profile.avatar_key as "ownerPhotoUri",
      to_char(match.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt",
      (select storage_key from dog_photos where dog_id = other.id and storage_key like 'https://%'
       order by position, id limit 1) as "photoUri",
      case when latest.walk_starts_at is null then latest.body else 'Proposition de balade' end as "lastMessage",
      to_char(latest.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "lastMessageAt"
    from matches match
    join dogs first on first.id = match.dog_1_id
    join dogs second on second.id = match.dog_2_id
    join dogs other on other.id = case when first.owner_id = ${userId} then second.id else first.id end
    join profiles profile on profile.user_id = other.owner_id
    left join lateral (
      select body, walk_starts_at, created_at from messages where match_id = match.id
      order by created_at desc, id desc limit 1
    ) latest on true
    where ${userId} in (first.owner_id, second.owner_id)
      ${matchId ? sql`and match.id = ${matchId}` : sql.empty()}
    order by coalesce(latest.created_at, match.created_at) desc, match.id
  `)
  return response.rows
}

function toMessage(row: typeof messages.$inferSelect, userId: string): ChatMessage {
  return {
    id: row.id,
    own: row.authorId === userId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    walk: row.walkStartsAt && row.walkMinutes && row.walkStatus
      ? { startsAt: row.walkStartsAt.toISOString(), minutes: row.walkMinutes, status: row.walkStatus }
      : null,
  }
}

function readWalk(value: unknown) {
  if (!value || typeof value !== 'object') return null
  const { startsAt, place, minutes } = value as Record<string, unknown>
  const date = typeof startsAt === 'string' ? new Date(startsAt) : null
  const body = typeof place === 'string' ? place.trim() : ''
  if (!date || !Number.isFinite(date.getTime()) || date.getTime() <= Date.now() ||
    !body || body.length > MAX_WALK_PLACE_LENGTH || typeof minutes !== 'number' ||
    !Number.isInteger(minutes) || minutes < 15 || minutes > 480) return null
  return { body, walkStartsAt: date, walkMinutes: minutes, walkStatus: 'pending' as const }
}

messaging.post('/ticket', (c) => c.json({ ticket: issueMessagingTicket(c.get('userId')) }))
messaging.get('/', async (c) => c.json(await listMatches(c.get('userId'))))

messaging.get('/:id', async (c) => {
  const id = c.req.param('id')
  const userId = c.get('userId')
  const before = c.req.query('before')
  if (!uuid.test(id)) return c.json({ error: 'Conversation introuvable.' }, 404)
  if (before && !uuid.test(before)) return c.json({ error: 'Curseur invalide.' }, 400)

  const [match] = await listMatches(userId, id)
  if (!match) return c.json({ error: 'Conversation introuvable.' }, 404)

  const page = await db.select().from(messages).where(and(
    eq(messages.matchId, id),
    before ? sql`(${messages.createdAt}, ${messages.id}) <
      (select created_at, id from messages where id = ${before} and match_id = ${id})` : undefined,
  )).orderBy(desc(messages.createdAt), desc(messages.id)).limit(PAGE_SIZE + 1)
  const visible = page.slice(0, PAGE_SIZE)
  return c.json({
    match,
    olderCursor: page.length > PAGE_SIZE ? visible[visible.length - 1].id : null,
    messages: visible.reverse().map((row) => toMessage(row, userId)),
  } satisfies ChatThread)
})

messaging.post('/:id', async (c) => {
  const matchId = c.req.param('id')
  const userId = c.get('userId')
  if (!uuid.test(matchId) || !(await listMatches(userId, matchId)).length) {
    return c.json({ error: 'Conversation introuvable.' }, 404)
  }
  const input = await c.req.json().catch(() => null)
  const fields = input?.kind === 'walk'
    ? readWalk(input)
    : input?.kind === 'text' && typeof input.body === 'string' && input.body.trim().length &&
        input.body.trim().length <= MAX_MESSAGE_LENGTH ? { body: input.body.trim() } : null
  if (!fields || typeof input.id !== 'string' || !uuid.test(input.id)) {
    return c.json({ error: 'Message ou proposition invalide.' }, 400)
  }

  const message = await db.transaction(async (tx) => {
    const [created] = await tx.insert(messages)
      .values({ id: input.id, matchId, authorId: userId, ...fields })
      .onConflictDoNothing().returning()
    if (created) {
      await tx.update(matches).set({ chatRevision: sql`${matches.chatRevision} + 1` }).where(eq(matches.id, matchId))
      return created
    }
    const [existing] = await tx.select().from(messages).where(and(
      eq(messages.id, input.id), eq(messages.matchId, matchId), eq(messages.authorId, userId),
    ))
    return existing
  })
  if (!message) return c.json({ error: 'Ce message existe déjà.' }, 409)
  return c.json(toMessage(message, userId), 201)
})

messaging.post('/:id/walks/:messageId', async (c) => {
  const { id: matchId, messageId } = c.req.param()
  const userId = c.get('userId')
  if (!uuid.test(matchId) || !uuid.test(messageId) || !(await listMatches(userId, matchId)).length) {
    return c.json({ error: 'Proposition introuvable.' }, 404)
  }
  const input = await c.req.json().catch(() => null)
  const alternative = input?.action === 'reschedule' ? readWalk(input) : null
  if (input?.action !== 'accept' && !alternative) return c.json({ error: 'Réponse invalide.' }, 400)

  const changed = await db.transaction(async (tx) => {
    const [proposal] = await tx.update(messages)
      .set({ walkStatus: alternative ? 'superseded' : 'accepted' })
      .where(and(
        eq(messages.id, messageId), eq(messages.matchId, matchId), eq(messages.walkStatus, 'pending'),
        sql`${messages.authorId} <> ${userId}`,
        sql`${messages.walkStartsAt} > now()`,
      )).returning()
    if (!proposal) return false
    if (alternative) await tx.insert(messages).values({ matchId, authorId: userId, ...alternative })
    await tx.update(matches).set({ chatRevision: sql`${matches.chatRevision} + 1` }).where(eq(matches.id, matchId))
    return true
  })
  return changed ? c.json({ saved: true }) : c.json({ error: 'Cette proposition ne peut plus être modifiée.' }, 409)
})

export { messaging }
