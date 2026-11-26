import { eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import {
  ACTIVITIES, ONBOARDING_LIMITS, TRAITS,
  type OnboardingDog, type OnboardingOwner, type OnboardingPayload, type OnboardingStatus,
} from '../../shared/onboarding'
import { auth, webOrigins } from './auth'
import { db } from './db'
import {
  activities, breeds, characters, dogActivities, dogCharacters, dogs, profiles,
} from './db/schema'

type Session = { userId: string; userName: string }

const onboarding = new Hono<{ Variables: Session }>()
const apiOrigin = typeof auth.options.baseURL === 'string'
  ? new URL(auth.options.baseURL).origin : undefined

onboarding.use('*', cors({
  origin: webOrigins,
  credentials: true,
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

onboarding.use('*', async (c, next) => {
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
  c.set('userName', session.user.name)
  await next()
})

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

class InvalidPayload extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** Texte nettoyé, obligatoire sauf `optional`, borné à `max` caractères. */
function readText(source: Record<string, unknown>, key: string, max: number, optional = false) {
  const value = source[key]
  if (optional && (value === null || value === undefined)) return null
  if (typeof value !== 'string') throw new InvalidPayload(`${key} invalide.`)
  const text = value.trim()
  if (!text) {
    if (optional) return null
    throw new InvalidPayload(`${key} manquant.`)
  }
  if (text.length > max) throw new InvalidPayload(`${key} trop long.`)
  return text
}

/** Date AAAA-MM-JJ existante, passée, et d'au plus `maxAge` ans. */
function readBirthDate(source: Record<string, unknown>, key: string, maxAge: number) {
  const value = source[key]
  const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null
  if (!match) throw new InvalidPayload(`${key} invalide.`)

  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const today = new Date()
  const exists = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  if (!exists || date > today || today.getUTCFullYear() - year > maxAge) {
    throw new InvalidPayload(`${key} invalide.`)
  }
  return value as string
}

/** Liste de choix sans doublon, prise dans `allowed`. */
function readChoices(source: Record<string, unknown>, key: string, allowed: readonly string[], min: number) {
  const value = source[key]
  if (!Array.isArray(value) || value.some((item) => !allowed.includes(item))) {
    throw new InvalidPayload(`${key} invalide.`)
  }
  const choices = [...new Set(value as string[])]
  if (choices.length < min) throw new InvalidPayload(`${key} manquant.`)
  return choices
}

function readOwner(value: unknown): OnboardingOwner {
  if (!isRecord(value)) throw new InvalidPayload('owner invalide.')
  const postalCode = value.postalCode
  if (typeof postalCode !== 'string' || !/^\d{5}$/.test(postalCode)) {
    throw new InvalidPayload('postalCode invalide.')
  }
  return {
    birthDate: readBirthDate(value, 'birthDate', 120),
    address: readText(value, 'address', ONBOARDING_LIMITS.address)!,
    postalCode,
    city: readText(value, 'city', ONBOARDING_LIMITS.city)!,
  }
}

function readDog(value: unknown): OnboardingDog {
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
  }
}

function readPayload(body: unknown): OnboardingPayload {
  if (!isRecord(body) || !Array.isArray(body.dogs)) throw new InvalidPayload('Corps invalide.')
  if (!body.dogs.length || body.dogs.length > ONBOARDING_LIMITS.dogs) {
    throw new InvalidPayload('Nombre de chiens invalide.')
  }
  return { owner: readOwner(body.owner), dogs: body.dogs.map(readDog) }
}

// ==========================================
// ENREGISTREMENT
// ==========================================

/** Enregistre le profil du propriétaire et ses chiens en une seule transaction. */
onboarding.post('/', async (c) => {
  let payload: OnboardingPayload
  try {
    payload = readPayload(await c.req.json())
  } catch (error) {
    const message = error instanceof InvalidPayload ? error.message : 'JSON invalide.'
    return c.json({ error: message }, 400)
  }

  const userId = c.get('userId')
  const { owner } = payload

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
    for (const { traits, activities: dogActivityNames, ...dog } of payload.dogs) {
      const [{ id }] = await tx.insert(dogs).values({ ownerId: userId, ...dog }).returning({ id: dogs.id })
      dogIds.push(id)

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
