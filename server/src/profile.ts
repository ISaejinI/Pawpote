import { asc, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'

import type { ProfileSummary } from '../../shared/profile'
import { db } from './db'
import { breeds, dogActivities, dogCharacters, dogPhotos, dogs, profiles } from './db/schema'
import { requireSession, sessionCors, type SessionVariables } from './session'

const profile = new Hono<{ Variables: SessionVariables }>()

profile.use('*', sessionCors)
profile.use('*', requireSession)

/** Garde seulement les URL publiques (les anciennes clés de stockage ne s'affichent pas). */
function publicUrl(value: string | null) {
  return value?.startsWith('https://') ? value : null
}

/**
 * Éléments d'une fiche de chien complète : la barre « Complété à X % » en compte la part remplie.
 * Le nom n'y figure pas, il est obligatoire.
 */
type CompletionFields = {
  photo: string | null
  breedId: number | null
  birthDate: string | null
  sex: string | null
  quirk: string | null
  favoriteToy: string | null
  description: string | null
  traitCount: number
  activityCount: number
}

function filled(text: string | null) {
  return !!text?.trim()
}

function completion(dog: CompletionFields) {
  const checks = [
    !!dog.photo,
    dog.breedId !== null,
    dog.birthDate !== null,
    dog.sex !== null,
    dog.traitCount > 0,
    filled(dog.quirk),
    filled(dog.favoriteToy),
    dog.activityCount > 0,
    filled(dog.description),
  ]
  return checks.filter(Boolean).length / checks.length
}

/** En-tête et liste « Mes chiens » de l'onglet Profil : mon prénom, ma photo et mes chiens. */
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
      breedId: dogs.breedId,
      birthDate: dogs.birthDate,
      sex: dogs.sex,
      quirk: dogs.quirk,
      favoriteToy: dogs.favoriteToy,
      description: dogs.description,
      traitCount: sql<number>`(
        select count(*) from ${dogCharacters} where ${dogCharacters.dogId} = ${dogs.id}
      )::integer`,
      activityCount: sql<number>`(
        select count(*) from ${dogActivities} where ${dogActivities.dogId} = ${dogs.id}
      )::integer`,
    }).from(dogs)
      .leftJoin(breeds, eq(breeds.id, dogs.breedId))
      .where(eq(dogs.ownerId, userId))
      .orderBy(asc(dogs.createdAt), asc(dogs.id)),
  ])

  // Sans ligne `profiles` (ancien compte), on reprend le prénom du compte
  const firstName = owner?.firstName ?? (c.get('userName').trim().split(/\s+/, 1)[0] || 'Moi')

  return c.json({
    owner: { firstName, photo: publicUrl(owner?.photo ?? null) },
    dogs: ownDogs.map((dog) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      photo: dog.photo,
      completion: completion(dog),
    })),
  } satisfies ProfileSummary)
})

export { profile }
