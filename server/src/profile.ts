import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { ACTIVITIES, ONBOARDING_LIMITS, TRAITS } from '../../shared/onboarding'
import {
  dogCompletion, type DogRemoval, type DogSheet, type DogUpdate, type ProfileSummary,
} from '../../shared/profile'
import { db } from './db'
import {
  activities, breeds, characters, dogActivities, dogCharacters, dogPhotos, dogs, profiles,
} from './db/schema'
import { requireSession, sessionCors, type SessionVariables } from './session'
import { isOwnPhotoKey, photoExists, photoUrl } from './storage'
import {
  InvalidPayload, isRecord, readBirthDate, readChoices, readText,
} from './validation'

const profile = new Hono<{ Variables: SessionVariables }>()

profile.use('*', sessionCors)
profile.use('*', requireSession)

const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

/** Garde seulement les URL publiques (les anciennes clés de stockage ne s'affichent pas). */
function publicUrl(value: string | null) {
  return value?.startsWith('https://') ? value : null
}

// ==========================================
// EN-TÊTE ET LISTE « MES CHIENS »
// ==========================================

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

// ==========================================
// FICHE D'UN CHIEN
// ==========================================

/** Mon chien, ou `undefined` s'il n'existe pas ou appartient à un autre compte. */
async function findOwnDog(userId: string, id: string) {
  if (!uuid.test(id)) return undefined
  const [dog] = await db.select().from(dogs)
    .where(and(eq(dogs.id, id), eq(dogs.ownerId, userId))).limit(1)
  return dog
}

async function dogPhotoUrls(dogId: string) {
  const rows = await db.select({ url: dogPhotos.storageKey }).from(dogPhotos)
    .where(and(eq(dogPhotos.dogId, dogId), sql`${dogPhotos.storageKey} like 'https://%'`))
    .orderBy(asc(dogPhotos.position), asc(dogPhotos.id))
  return rows.map(({ url }) => url)
}

profile.get('/dogs/:id', async (c) => {
  const userId = c.get('userId')
  const dog = await findOwnDog(userId, c.req.param('id'))
  if (!dog) return c.json({ error: 'Chien introuvable.' }, 404)

  const [[breed], traits, hobbies, photos, [otherDog]] = await Promise.all([
    dog.breedId === null ? [] : db.select({ id: breeds.id, name: breeds.name }).from(breeds)
      .where(eq(breeds.id, dog.breedId)).limit(1),
    db.select({ name: characters.name }).from(dogCharacters)
      .innerJoin(characters, eq(characters.id, dogCharacters.characterId))
      .where(eq(dogCharacters.dogId, dog.id)),
    db.select({ name: activities.name }).from(dogActivities)
      .innerJoin(activities, eq(activities.id, dogActivities.activityId))
      .where(eq(dogActivities.dogId, dog.id)),
    dogPhotoUrls(dog.id),
    db.select({ id: dogs.id }).from(dogs)
      .where(and(eq(dogs.ownerId, userId), ne(dogs.id, dog.id))).limit(1),
  ])

  // Traits et activités dans l'ordre des listes de choix
  const traitNames = new Set(traits.map(({ name }) => name))
  const activityNames = new Set(hobbies.map(({ name }) => name))

  return c.json({
    id: dog.id,
    name: dog.name,
    sex: dog.sex,
    birthDate: dog.birthDate,
    breed: breed ?? null,
    traits: TRAITS.filter((name) => traitNames.has(name)),
    quirk: dog.quirk,
    favoriteToy: dog.favoriteToy,
    activities: ACTIVITIES.filter((name) => activityNames.has(name)),
    description: dog.description,
    photos,
    isLastDog: !otherDog,
  } satisfies DogSheet)
})

function readUpdate(body: unknown): DogUpdate {
  if (!isRecord(body)) throw new InvalidPayload('Corps invalide.')
  if (body.sex !== 'female' && body.sex !== 'male') throw new InvalidPayload('sex invalide.')
  const breedId = body.breedId
  if (breedId !== null && !(typeof breedId === 'number' && Number.isSafeInteger(breedId) && breedId > 0)) {
    throw new InvalidPayload('breedId invalide.')
  }
  const photos = body.photos
  if (
    !Array.isArray(photos) || photos.length > ONBOARDING_LIMITS.dogPhotos ||
    !photos.every((photo) => typeof photo === 'string') || new Set(photos).size !== photos.length
  ) {
    throw new InvalidPayload('photos invalides.')
  }
  return {
    name: readText(body, 'name', ONBOARDING_LIMITS.dogName)!,
    sex: body.sex,
    birthDate: readBirthDate(body, 'birthDate', 30),
    breedId,
    traits: readChoices(body, 'traits', TRAITS, 0),
    quirk: readText(body, 'quirk', ONBOARDING_LIMITS.quirk, true),
    favoriteToy: readText(body, 'favoriteToy', ONBOARDING_LIMITS.favoriteToy, true),
    activities: readChoices(body, 'activities', ACTIVITIES, 0),
    description: readText(body, 'description', ONBOARDING_LIMITS.description, true),
    photos: photos as string[],
  }
}

/** Enregistre la fiche modifiée : champs, traits, activités et photos, en une transaction. */
profile.post('/dogs/:id', async (c) => {
  const userId = c.get('userId')
  const dog = await findOwnDog(userId, c.req.param('id'))
  if (!dog) return c.json({ error: 'Chien introuvable.' }, 404)

  let update: DogUpdate
  try {
    update = readUpdate(await c.req.json())
  } catch (error) {
    const message = error instanceof InvalidPayload ? error.message : 'JSON invalide.'
    return c.json({ error: message }, 400)
  }

  if (update.breedId !== null) {
    const [breed] = await db.select({ id: breeds.id }).from(breeds).where(eq(breeds.id, update.breedId)).limit(1)
    if (!breed) return c.json({ error: 'Race inconnue.' }, 400)
  }

  // Une photo est soit déjà à ce chien (URL), soit tout juste envoyée par cet utilisateur (clé)
  const currentPhotos = new Set(await dogPhotoUrls(dog.id))
  const photoUrls: string[] = []
  for (const photo of update.photos) {
    if (currentPhotos.has(photo)) {
      photoUrls.push(photo)
    } else if (isOwnPhotoKey(userId, photo) && await photoExists(photo)) {
      photoUrls.push(photoUrl(photo))
    } else {
      return c.json({ error: 'Photo introuvable.' }, 400)
    }
  }

  await db.transaction(async (tx) => {
    const { traits, activities: activityNames } = update
    await tx.update(dogs).set({
      name: update.name,
      sex: update.sex,
      birthDate: update.birthDate,
      breedId: update.breedId,
      quirk: update.quirk,
      favoriteToy: update.favoriteToy,
      description: update.description,
    }).where(eq(dogs.id, dog.id))

    // Les référentiels ne contiennent que les choix déjà utilisés : on ajoute ceux qui manquent
    await tx.delete(dogCharacters).where(eq(dogCharacters.dogId, dog.id))
    if (traits.length) {
      await tx.insert(characters).values(traits.map((name) => ({ name }))).onConflictDoNothing()
      const rows = await tx.select().from(characters).where(inArray(characters.name, traits))
      await tx.insert(dogCharacters).values(rows.map((row) => ({ dogId: dog.id, characterId: row.id })))
    }

    await tx.delete(dogActivities).where(eq(dogActivities.dogId, dog.id))
    if (activityNames.length) {
      await tx.insert(activities).values(activityNames.map((name) => ({ name }))).onConflictDoNothing()
      const rows = await tx.select().from(activities).where(inArray(activities.name, activityNames))
      await tx.insert(dogActivities).values(rows.map((row) => ({ dogId: dog.id, activityId: row.id })))
    }

    await tx.delete(dogPhotos).where(eq(dogPhotos.dogId, dog.id))
    if (photoUrls.length) {
      await tx.insert(dogPhotos).values(
        photoUrls.map((storageKey, position) => ({ dogId: dog.id, storageKey, position })),
      )
    }
  })

  return c.json({ ok: true })
})

/**
 * Retire un chien de mon compte. Sans chien, le compte repasse par l'onboarding :
 * la réponse indique combien il en reste.
 */
profile.post('/dogs/:id/delete', async (c) => {
  const userId = c.get('userId')
  const dog = await findOwnDog(userId, c.req.param('id'))
  if (!dog) return c.json({ error: 'Chien introuvable.' }, 404)

  // Photos, traits, activités, swipes et matchs partent avec lui (suppression en cascade)
  await db.delete(dogs).where(eq(dogs.id, dog.id))

  const [{ remaining }] = await db.select({ remaining: sql<number>`count(*)::integer` })
    .from(dogs).where(eq(dogs.ownerId, userId))
  return c.json({ remainingDogs: remaining } satisfies DogRemoval)
})

export { profile }
