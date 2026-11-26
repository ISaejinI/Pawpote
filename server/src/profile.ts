import { asc, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'

import type { ProfileSummary } from '../../shared/profile'
import { db } from './db'
import { breeds, dogPhotos, dogs, profiles } from './db/schema'
import { requireSession, sessionCors, type SessionVariables } from './session'

const profile = new Hono<{ Variables: SessionVariables }>()

profile.use('*', sessionCors)
profile.use('*', requireSession)

/** Garde seulement les URL publiques (les anciennes clés de stockage ne s'affichent pas). */
function publicUrl(value: string | null) {
  return value?.startsWith('https://') ? value : null
}

/** En-tête de l'onglet Profil : mon prénom, ma photo et mes chiens. */
profile.get('/', async (c) => {
  const userId = c.get('userId')

  const [[owner], ownDogs] = await Promise.all([
    db.select({ firstName: profiles.firstName, photo: profiles.avatarKey })
      .from(profiles).where(eq(profiles.userId, userId)).limit(1),
    db.select({
      id: dogs.id,
      name: dogs.name,
      breed: breeds.name,
      age: sql<number | null>`extract(year from age(current_date, ${dogs.birthDate}))::integer`,
      photo: sql<string | null>`(
        select ${dogPhotos.storageKey} from ${dogPhotos}
        where ${dogPhotos.dogId} = ${dogs.id} and ${dogPhotos.storageKey} like 'https://%'
        order by ${dogPhotos.position}, ${dogPhotos.id} limit 1
      )`,
    }).from(dogs)
      .leftJoin(breeds, eq(breeds.id, dogs.breedId))
      .where(eq(dogs.ownerId, userId))
      .orderBy(asc(dogs.createdAt), asc(dogs.id)),
  ])

  // Sans ligne `profiles` (ancien compte), on reprend le prénom du compte
  const firstName = owner?.firstName ?? (c.get('userName').trim().split(/\s+/, 1)[0] || 'Moi')

  return c.json({
    owner: { firstName, photo: publicUrl(owner?.photo ?? null) },
    dogs: ownDogs,
  } satisfies ProfileSummary)
})

export { profile }
