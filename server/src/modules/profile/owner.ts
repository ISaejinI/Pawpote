import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { approximateLocation, readCoordinates } from '../../../../shared/location'
import { ONBOARDING_LIMITS } from '../../../../shared/onboarding'
import {
  NAME_MAX_LENGTH, type OwnerAddressUpdate, type OwnerIdentityUpdate, type OwnerInfo,
} from '../../../../shared/profile'
import { db } from '../../db'
import { user } from '../../db/auth-schema'
import { profiles } from '../../db/schema'
import { isOwnPhotoKey, photoExists, photoUrl, publicPhotoUrl } from '../../lib/storage'
import { InvalidPayload, isRecord, readBirthDate, readText } from '../../lib/validation'
import type { SessionVariables } from '../auth/session'

/** Mes informations : identité et adresse du domicile. */
const ownerInfo = new Hono<{ Variables: SessionVariables }>()

ownerInfo.get('/', async (c) => {
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
    photo: publicPhotoUrl(owner.photo),
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
ownerInfo.post('/identity', async (c) => {
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
ownerInfo.post('/address', async (c) => {
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

export { ownerInfo }
