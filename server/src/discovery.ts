import { and, asc, eq, inArray, ne, notExists, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import type { DiscoveryFeed, DogDetails, SwipeResult } from '../../shared/discovery'
import demoPhotos from '../data/demo-photos.json'
import { auth, webOrigins } from './auth'
import { db } from './db'
import { user } from './db/auth-schema'
import {
  activities, breeds, characters, dogActivities, dogCharacters, dogPhotos, dogs, matches,
  profiles, swipes,
} from './db/schema'

const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
const discovery = new Hono<{ Variables: { userId: string } }>()
const apiOrigin = typeof auth.options.baseURL === 'string'
  ? new URL(auth.options.baseURL).origin : undefined
const demoCredits = new Map(demoPhotos.map(({ url, author, license, file }) =>
  [url, { author, license, file }] as const))

discovery.use('*', cors({
  origin: webOrigins,
  credentials: true,
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

discovery.use('*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store')
  if (c.req.method === 'POST') {
    const origin = c.req.header('Origin')
    if (origin && origin !== apiOrigin && !webOrigins.includes(origin)) {
      return c.json({ error: 'Origine non autorisée.' }, 403)
    }
    if (c.req.header('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return c.json({ error: 'Un contenu JSON est requis.' }, 415)
    }
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Connexion requise.' }, 401)
  c.set('userId', session.user.id)
  await next()
})

const card = {
  id: dogs.id,
  name: dogs.name,
  breed: breeds.name,
  favoriteToy: dogs.favoriteToy,
  age: sql<number | null>`extract(year from age(current_date, ${dogs.birthDate}))::integer`,
  photo: sql<string | null>`(
    select ${dogPhotos.storageKey} from ${dogPhotos}
    where ${dogPhotos.dogId} = ${dogs.id} and ${dogPhotos.storageKey} like 'https://%'
    order by ${dogPhotos.position}, ${dogPhotos.id} limit 1
  )`,
}

function availableDogs(userId: string) {
  return and(ne(dogs.ownerId, userId), notExists(
    db.select({ id: swipes.id }).from(swipes).where(and(
      eq(swipes.swiperUserId, userId), eq(swipes.targetDogId, dogs.id), eq(swipes.reviewed, true),
    )),
  ))
}

discovery.get('/', async (c) => {
  const userId = c.get('userId')
  const feed = await db.select(card).from(dogs)
    .leftJoin(breeds, eq(breeds.id, dogs.breedId))
    .where(availableDogs(userId)).orderBy(asc(dogs.createdAt), asc(dogs.id)).limit(24)
  const [otherDog] = feed.length ? [] : await db.select({ id: dogs.id }).from(dogs)
    .where(ne(dogs.ownerId, userId)).limit(1)
  return c.json({ dogs: feed, canRestart: !!otherDog } satisfies DiscoveryFeed)
})

discovery.get('/dogs/:id', async (c) => {
  const id = c.req.param('id')
  if (!uuid.test(id)) return c.json({ error: 'Chien introuvable.' }, 404)
  const [dog] = await db.select({
    ...card, sex: dogs.sex, description: dogs.description, quirk: dogs.quirk,
    firstName: profiles.firstName, avatar: profiles.avatarKey,
  }).from(dogs).innerJoin(profiles, eq(profiles.userId, dogs.ownerId))
    .leftJoin(breeds, eq(breeds.id, dogs.breedId)).where(eq(dogs.id, id)).limit(1)
  if (!dog) return c.json({ error: 'Chien introuvable.' }, 404)

  const [photos, traits, hobbies] = await Promise.all([
    db.select({ value: dogPhotos.storageKey }).from(dogPhotos)
      .where(and(eq(dogPhotos.dogId, id), sql`${dogPhotos.storageKey} like 'https://%'`))
      .orderBy(asc(dogPhotos.position), asc(dogPhotos.id)),
    db.select({ value: characters.name }).from(dogCharacters)
      .innerJoin(characters, eq(characters.id, dogCharacters.characterId))
      .where(eq(dogCharacters.dogId, id)).orderBy(asc(characters.name)),
    db.select({ value: activities.name }).from(dogActivities)
      .innerJoin(activities, eq(activities.id, dogActivities.activityId))
      .where(eq(dogActivities.dogId, id)).orderBy(asc(activities.name)),
  ])
  const { firstName, avatar, ...details } = dog
  return c.json({
    ...details,
    photos: photos.map(({ value }) => value),
    traits: traits.map(({ value }) => value),
    activities: hobbies.map(({ value }) => value),
    owner: { firstName, photo: avatar?.startsWith('https://') ? avatar : null },
    photoCredits: photos.flatMap(({ value }) => {
      const credit = demoCredits.get(value)
      return credit ? [credit] : []
    }),
  } satisfies DogDetails)
})

discovery.post('/swipes', async (c) => {
  const input: { dogId?: unknown; action?: unknown } | null = await c.req.json().catch(() => null)
  if (typeof input?.dogId !== 'string' || !uuid.test(input.dogId) ||
    (input.action !== 'like' && input.action !== 'dislike')) {
    return c.json({ error: 'Choix invalide.' }, 400)
  }
  const { dogId, action } = input
  const userId = c.get('userId')
  const result = await db.transaction(async (tx): Promise<SwipeResult | null> => {
    const [target] = await tx.select({ ownerId: dogs.ownerId, name: dogs.name }).from(dogs)
      .where(and(eq(dogs.id, dogId), ne(dogs.ownerId, userId)))
    if (!target) return null

    // Both directions share the same lock order so simultaneous likes can see each other.
    await tx.select({ id: user.id }).from(user).where(inArray(user.id, [userId, target.ownerId]))
      .orderBy(asc(user.id)).for('update')
    const [inserted] = await tx.insert(swipes)
      .values({ swiperUserId: userId, targetDogId: dogId, action })
      .onConflictDoNothing().returning({ id: swipes.id })
    if (!inserted || action === 'dislike') return { matches: [] }

    const reciprocals = await tx.select({ id: dogs.id, name: dogs.name }).from(swipes)
      .innerJoin(dogs, eq(dogs.id, swipes.targetDogId))
      .where(and(eq(swipes.swiperUserId, target.ownerId), eq(dogs.ownerId, userId),
        eq(swipes.reviewed, true), eq(swipes.action, 'like')))
    if (!reciprocals.length) return { matches: [] }

    const created = await tx.insert(matches).values(reciprocals.map(({ id }) => {
      const [dog1Id, dog2Id] = [id, dogId.toLowerCase()].sort()
      return { dog1Id, dog2Id }
    })).onConflictDoNothing().returning()
    const names = new Map(reciprocals.map((dog) => [dog.id, dog.name]))
    return { matches: created.map((match) => ({
      id: match.id,
      ownDog: names.get(match.dog1Id) ?? names.get(match.dog2Id)!,
      targetDog: target.name,
    })) }
  })

  return result ? c.json(result) : c.json({ error: 'Chien indisponible.' }, 404)
})

discovery.post('/restart', async (c) => {
  const userId = c.get('userId')
  const restarted = await db.transaction(async (tx) => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for('update')
    const [available] = await tx.select({ id: dogs.id }).from(dogs).where(availableDogs(userId)).limit(1)
    if (available) return false
    await tx.update(swipes).set({ reviewed: false })
      .where(and(eq(swipes.swiperUserId, userId), eq(swipes.reviewed, true)))
    return true
  })
  return restarted ? c.json({ restarted }) : c.json({ error: 'Il reste des chiens à découvrir.' }, 409)
})

export { discovery }
