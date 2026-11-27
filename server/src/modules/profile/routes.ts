import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { approximateLocation, readCoordinates } from '../../../../shared/location'
import { ACTIVITIES, ONBOARDING_LIMITS, TRAITS, type OnboardingDog } from '../../../../shared/onboarding'
import {
  dogCompletion, NAME_MAX_LENGTH, type DogRemoval, type DogSheet, type DogUpdate, type NewDog,
  type OwnerAddressUpdate, type OwnerIdentityUpdate, type OwnerInfo, type ProfileSummary,
} from '../../../../shared/profile'
import { db } from '../../db'
import { user } from '../../db/auth-schema'
import {
  activities, breeds, characters, dogActivities, dogCharacters, dogPhotos, dogs, profiles,
} from '../../db/schema'
import { checkNewDogs, insertDogs, readNewDog } from '../dogs/dogs'
import { requireSession, sessionCors, type SessionVariables } from '../auth/session'
import { isOwnPhotoKey, photoExists, photoUrl } from '../../lib/storage'
import {
  InvalidPayload, isRecord, readBirthDate, readChoices, readText,
} from '../../lib/validation'

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

/** Ajoute un chien à mon compte, avec les mêmes informations que l'onboarding (étapes 1 à 4). */
profile.post('/dogs', async (c) => {
  const userId = c.get('userId')

  let dog: OnboardingDog
  try {
    dog = readNewDog(userId, await c.req.json())
  } catch (error) {
    const message = error instanceof InvalidPayload ? error.message : 'JSON invalide.'
    return c.json({ error: message }, 400)
  }

  const dogError = await checkNewDogs([dog])
  if (dogError) return c.json({ error: dogError }, 400)

  // Le profil existe depuis l'onboarding ; sans lui, le chien n'aurait pas de propriétaire
  const [owner] = await db.select({ userId: profiles.userId }).from(profiles)
    .where(eq(profiles.userId, userId)).limit(1)
  if (!owner) return c.json({ error: 'Profil introuvable.' }, 409)

  const [id] = await db.transaction((tx) => insertDogs(tx, userId, [dog]))
  return c.json({ id } satisfies NewDog, 201)
})

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

// ==========================================
// MES INFORMATIONS ET MON ADRESSE
// ==========================================

profile.get('/owner', async (c) => {
  const userId = c.get('userId')
  const [owner] = await db.select({
    firstName: profiles.firstName,
    lastName: profiles.lastName,
    birthDate: profiles.birthDate,
    photo: profiles.avatarKey,
    address: profiles.address,
    postalCode: profiles.postalCode,
    city: profiles.city,
    homeLatitude: profiles.homeLatitude,
    homeLongitude: profiles.homeLongitude,
  }).from(profiles).where(eq(profiles.userId, userId)).limit(1)
  if (!owner) return c.json({ error: 'Profil introuvable.' }, 404)

  const { homeLatitude, homeLongitude, ...info } = owner
  return c.json({
    ...info,
    photo: publicUrl(owner.photo),
    homeLocation: readCoordinates({ latitude: homeLatitude, longitude: homeLongitude }),
  } satisfies OwnerInfo)
})

function readIdentity(userId: string, body: unknown): OwnerIdentityUpdate {
  if (!isRecord(body)) throw new InvalidPayload('Corps invalide.')
  const photo = body.photo
  if (photo !== null && typeof photo !== 'string') throw new InvalidPayload('photo invalide.')
  return {
    firstName: readText(body, 'firstName', NAME_MAX_LENGTH)!,
    lastName: readText(body, 'lastName', NAME_MAX_LENGTH)!,
    birthDate: readBirthDate(body, 'birthDate', 120),
    photo,
  }
}

/** Prénom, nom, date de naissance et photo. Le nom affiché du compte suit le prénom et le nom. */
profile.post('/owner/identity', async (c) => {
  const userId = c.get('userId')
  let identity: OwnerIdentityUpdate
  try {
    identity = readIdentity(userId, await c.req.json())
  } catch (error) {
    const message = error instanceof InvalidPayload ? error.message : 'JSON invalide.'
    return c.json({ error: message }, 400)
  }

  const [current] = await db.select({ photo: profiles.avatarKey }).from(profiles)
    .where(eq(profiles.userId, userId)).limit(1)
  if (!current) return c.json({ error: 'Profil introuvable.' }, 404)

  // Ma photo actuelle (URL), une photo tout juste envoyée (clé), ou aucune
  let avatarKey: string | null = null
  if (identity.photo === current.photo) {
    avatarKey = current.photo
  } else if (identity.photo !== null) {
    if (!isOwnPhotoKey(userId, identity.photo) || !(await photoExists(identity.photo))) {
      return c.json({ error: 'Photo introuvable.' }, 400)
    }
    avatarKey = photoUrl(identity.photo)
  }

  await db.transaction(async (tx) => {
    await tx.update(profiles).set({
      firstName: identity.firstName,
      lastName: identity.lastName,
      birthDate: identity.birthDate,
      avatarKey,
    }).where(eq(profiles.userId, userId))
    await tx.update(user).set({ name: `${identity.firstName} ${identity.lastName}` })
      .where(eq(user.id, userId))
  })

  return c.json({ ok: true })
})

function readAddress(body: unknown): OwnerAddressUpdate {
  if (!isRecord(body)) throw new InvalidPayload('Corps invalide.')
  const postalCode = body.postalCode
  if (typeof postalCode !== 'string' || !/^\d{5}$/.test(postalCode)) {
    throw new InvalidPayload('postalCode invalide.')
  }
  const homeLocation = readCoordinates(body.homeLocation)
  if (body.homeLocation != null && !homeLocation) throw new InvalidPayload('Position du domicile invalide.')
  return {
    address: readText(body, 'address', ONBOARDING_LIMITS.address)!,
    postalCode,
    city: readText(body, 'city', ONBOARDING_LIMITS.city)!,
    // Seule une zone approximative est gardée, comme à l'onboarding
    homeLocation: homeLocation ? approximateLocation(homeLocation) : null,
  }
}

/** Adresse, code postal, ville et zone approximative du domicile (distances sans GPS). */
profile.post('/owner/address', async (c) => {
  const userId = c.get('userId')
  let address: OwnerAddressUpdate
  try {
    address = readAddress(await c.req.json())
  } catch (error) {
    const message = error instanceof InvalidPayload ? error.message : 'JSON invalide.'
    return c.json({ error: message }, 400)
  }

  const updated = await db.update(profiles).set({
    address: address.address,
    postalCode: address.postalCode,
    city: address.city,
    homeLatitude: address.homeLocation?.latitude ?? null,
    homeLongitude: address.homeLocation?.longitude ?? null,
  }).where(eq(profiles.userId, userId)).returning({ userId: profiles.userId })
  if (!updated.length) return c.json({ error: 'Profil introuvable.' }, 404)

  return c.json({ ok: true })
})

export { profile }
