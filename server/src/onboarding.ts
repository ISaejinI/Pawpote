import { eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'

import { approximateHomeLocation, readCoordinates } from '../../shared/location'
import {
  ACTIVITIES, ONBOARDING_LIMITS, TRAITS,
  type OnboardingDog, type OnboardingOwner, type OnboardingPayload, type OnboardingStatus,
} from '../../shared/onboarding'
import { db } from './db'
import {
  activities, breeds, characters, dogActivities, dogCharacters, dogPhotos, dogs, profiles,
} from './db/schema'
import { requireSession, sessionCors, type SessionVariables } from './session'
import { photoExists, photoUrl } from './storage'
import {
  InvalidPayload, isRecord, readBirthDate, readChoices, readPhotoKeys, readText,
} from './validation'

const onboarding = new Hono<{ Variables: SessionVariables }>()

onboarding.use('*', sessionCors)
onboarding.use('*', requireSession)

/** L'onboarding est terminé dès que l'utilisateur a au moins un chien. */
async function hasDog(userId: string) {
  const [dog] = await db.select({ id: dogs.id }).from(dogs).where(eq(dogs.ownerId, userId)).limit(1)
  return !!dog
}

onboarding.get('/', async (c) => {
  return c.json({ completed: await hasDog(c.get('userId')) } satisfies OnboardingStatus)
})

// ==========================================
// VALIDATION DU CORPS
// ==========================================

function readOwner(userId: string, value: unknown): OnboardingOwner {
  if (!isRecord(value)) throw new InvalidPayload('owner invalide.')
  const postalCode = value.postalCode
  if (typeof postalCode !== 'string' || !/^\d{5}$/.test(postalCode)) {
    throw new InvalidPayload('postalCode invalide.')
  }
  const homeLocation = readCoordinates(value.homeLocation)
  if (value.homeLocation != null && !homeLocation) throw new InvalidPayload('Position du domicile invalide.')
  return {
    birthDate: readBirthDate(value, 'birthDate', 120),
    address: readText(value, 'address', ONBOARDING_LIMITS.address)!,
    postalCode,
    city: readText(value, 'city', ONBOARDING_LIMITS.city)!,
    homeLocation: homeLocation ? approximateHomeLocation(homeLocation) : null,
    photo: value.photo === null || value.photo === undefined
      ? null : readPhotoKeys(userId, [value.photo], 1, 1)[0],
  }
}

function readDog(userId: string, value: unknown): OnboardingDog {
  if (!isRecord(value)) throw new InvalidPayload('dog invalide.')
  if (value.sex !== 'female' && value.sex !== 'male') throw new InvalidPayload('sex invalide.')
  const breedId = value.breedId
  if (breedId !== null && !(typeof breedId === 'number' && Number.isSafeInteger(breedId) && breedId > 0)) {
    throw new InvalidPayload('breedId invalide.')
  }
  return {
    name: readText(value, 'name', ONBOARDING_LIMITS.dogName)!,
    sex: value.sex,
    birthDate: readBirthDate(value, 'birthDate', 30),
    breedId,
    traits: readChoices(value, 'traits', TRAITS, 1),
    quirk: readText(value, 'quirk', ONBOARDING_LIMITS.quirk)!,
    favoriteToy: readText(value, 'favoriteToy', ONBOARDING_LIMITS.favoriteToy, true),
    activities: readChoices(value, 'activities', ACTIVITIES, 0),
    description: readText(value, 'description', ONBOARDING_LIMITS.description)!,
    photos: readPhotoKeys(userId, value.photos, 1, ONBOARDING_LIMITS.dogPhotos),
  }
}

function readPayload(userId: string, body: unknown): OnboardingPayload {
  if (!isRecord(body) || !Array.isArray(body.dogs)) throw new InvalidPayload('Corps invalide.')
  if (!body.dogs.length || body.dogs.length > ONBOARDING_LIMITS.dogs) {
    throw new InvalidPayload('Nombre de chiens invalide.')
  }
  return {
    owner: readOwner(userId, body.owner),
    dogs: body.dogs.map((dog) => readDog(userId, dog)),
  }
}

// ==========================================
// ENREGISTREMENT
// ==========================================

/** Enregistre le profil du propriétaire et ses chiens en une seule transaction. */
onboarding.post('/', async (c) => {
  const userId = c.get('userId')
  let payload: OnboardingPayload
  try {
    payload = readPayload(userId, await c.req.json())
  } catch (error) {
    const message = error instanceof InvalidPayload ? error.message : 'JSON invalide.'
    return c.json({ error: message }, 400)
  }

  // Les photos doivent déjà être dans le stockage : on n'enregistre pas de lien cassé
  const photoKeys = [
    ...payload.dogs.flatMap((dog) => dog.photos),
    ...(payload.owner.photo ? [payload.owner.photo] : []),
  ]
  const uploaded = await Promise.all(photoKeys.map(photoExists))
  if (uploaded.includes(false)) return c.json({ error: 'Photo introuvable dans le stockage.' }, 400)

  const { photo: ownerPhoto, homeLocation, ...ownerFields } = payload.owner
  const owner = {
    ...ownerFields,
    homeLatitude: homeLocation?.latitude ?? null,
    homeLongitude: homeLocation?.longitude ?? null,
    avatarKey: ownerPhoto ? photoUrl(ownerPhoto) : null,
  }

  const breedIds = [...new Set(payload.dogs.flatMap((dog) => (dog.breedId ? [dog.breedId] : [])))]
  if (breedIds.length) {
    const known = await db.select({ id: breeds.id }).from(breeds).where(inArray(breeds.id, breedIds))
    if (known.length !== breedIds.length) return c.json({ error: 'Race inconnue.' }, 400)
  }

  const created = await db.transaction(async (tx) => {
    // Le profil existe depuis l'inscription ; on le crée quand même pour les anciens comptes.
    // La mise à jour verrouille la ligne : deux envois simultanés ne peuvent pas doubler les chiens.
    const firstName = c.get('userName').trim().split(/\s+/)[0] || c.get('userName')
    await tx.insert(profiles)
      .values({ userId, firstName, ...owner })
      .onConflictDoUpdate({ target: profiles.userId, set: owner })

    const [existingDog] = await tx.select({ id: dogs.id }).from(dogs).where(eq(dogs.ownerId, userId)).limit(1)
    if (existingDog) return null

    // Les référentiels ne contiennent que les choix déjà utilisés : on ajoute ceux qui manquent
    const traitNames = [...new Set(payload.dogs.flatMap((dog) => dog.traits))]
    const activityNames = [...new Set(payload.dogs.flatMap((dog) => dog.activities))]
    if (traitNames.length) {
      await tx.insert(characters).values(traitNames.map((name) => ({ name }))).onConflictDoNothing()
    }
    if (activityNames.length) {
      await tx.insert(activities).values(activityNames.map((name) => ({ name }))).onConflictDoNothing()
    }
    const traitIds = new Map(traitNames.length
      ? (await tx.select().from(characters).where(inArray(characters.name, traitNames)))
        .map((row) => [row.name, row.id])
      : [])
    const activityIds = new Map(activityNames.length
      ? (await tx.select().from(activities).where(inArray(activities.name, activityNames)))
        .map((row) => [row.name, row.id])
      : [])

    const dogIds: string[] = []
    for (const { traits, activities: dogActivityNames, photos, ...dog } of payload.dogs) {
      const [{ id }] = await tx.insert(dogs).values({ ownerId: userId, ...dog }).returning({ id: dogs.id })
      dogIds.push(id)

      // `storage_key` garde l'URL publique : la découverte l'affiche telle quelle
      await tx.insert(dogPhotos).values(
        photos.map((key, position) => ({ dogId: id, storageKey: photoUrl(key), position })),
      )

      await tx.insert(dogCharacters).values(traits.map((name) => ({ dogId: id, characterId: traitIds.get(name)! })))
      if (dogActivityNames.length) {
        await tx.insert(dogActivities).values(
          dogActivityNames.map((name) => ({ dogId: id, activityId: activityIds.get(name)! })),
        )
      }
    }
    return dogIds
  })

  if (!created) return c.json({ error: 'L’onboarding est déjà terminé.' }, 409)
  return c.json({ dogIds: created }, 201)
})

export { onboarding }
