import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { approximateLocation, readCoordinates } from '../../shared/location'
import {
  ONBOARDING_LIMITS, type OnboardingOwner, type OnboardingPayload, type OnboardingStatus,
} from '../../shared/onboarding'
import { db } from './db'
import { dogs, profiles } from './db/schema'
import { checkNewDogs, insertDogs, readNewDog } from './dogs'
import { requireSession, sessionCors, type SessionVariables } from './session'
import { photoExists, photoUrl } from './storage'
import { InvalidPayload, isRecord, readBirthDate, readPhotoKeys, readText } from './validation'

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
    homeLocation: homeLocation ? approximateLocation(homeLocation) : null,
    photo: value.photo === null || value.photo === undefined
      ? null : readPhotoKeys(userId, [value.photo], 1, 1)[0],
  }
}

function readPayload(userId: string, body: unknown): OnboardingPayload {
  if (!isRecord(body) || !Array.isArray(body.dogs)) throw new InvalidPayload('Corps invalide.')
  if (!body.dogs.length || body.dogs.length > ONBOARDING_LIMITS.dogs) {
    throw new InvalidPayload('Nombre de chiens invalide.')
  }
  return {
    owner: readOwner(userId, body.owner),
    dogs: body.dogs.map((dog) => readNewDog(userId, dog)),
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
  const dogsError = await checkNewDogs(payload.dogs)
  if (dogsError) return c.json({ error: dogsError }, 400)
  if (payload.owner.photo && !(await photoExists(payload.owner.photo))) {
    return c.json({ error: 'Photo introuvable dans le stockage.' }, 400)
  }

  const { photo: ownerPhoto, homeLocation, ...ownerFields } = payload.owner
  const owner = {
    ...ownerFields,
    homeLatitude: homeLocation?.latitude ?? null,
    homeLongitude: homeLocation?.longitude ?? null,
    avatarKey: ownerPhoto ? photoUrl(ownerPhoto) : null,
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

    return insertDogs(tx, userId, payload.dogs)
  })

  if (!created) return c.json({ error: 'L’onboarding est déjà terminé.' }, 409)
  return c.json({ dogIds: created }, 201)
})

export { onboarding }
