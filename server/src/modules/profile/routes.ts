import { asc, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { dogCompletion, type ProfileSummary } from '../../../../shared/profile'
import { db } from '../../db'
import { breeds, dogActivities, dogCharacters, dogPhotos, dogs, profiles } from '../../db/schema'
import { publicPhotoUrl } from '../../lib/storage'
import { requireSession, sessionCors, type SessionVariables } from '../auth/session'
import { dogSheets } from './dogs'
import { ownerInfo } from './owner'

/**
 * Onglet Profil : résumé (`/`), fiches de mes chiens (`/dogs`) et mes informations (`/owner`).
 * Les routes montées héritent de la session obligatoire déclarée ici.
 */
const profile = new Hono<{ Variables: SessionVariables }>()

profile.use('*', sessionCors)
profile.use('*', requireSession)

profile.route('/dogs', dogSheets)
profile.route('/owner', ownerInfo)

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
    owner: { firstName, photo: publicPhotoUrl(owner?.photo ?? null) },
    dogs: ownDogs.map((dog) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      photo: dog.photo,
      completion: dogCompletion({
        hasPhoto: !!dog.photo,
        hasBreed: dog.breedId !== null,
        hasBirthDate: dog.birthDate !== null,
        hasSex: dog.sex !== null,
        traitCount: dog.traitCount,
        quirk: dog.quirk,
        favoriteToy: dog.favoriteToy,
        activityCount: dog.activityCount,
        description: dog.description,
      }).value,
    })),
  } satisfies ProfileSummary)
})

export { profile }
