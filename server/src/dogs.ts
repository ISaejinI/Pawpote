import { inArray } from 'drizzle-orm'

import { ACTIVITIES, ONBOARDING_LIMITS, TRAITS, type OnboardingDog } from '../../shared/onboarding'
import { db } from './db'
import {
  activities, breeds, characters, dogActivities, dogCharacters, dogPhotos, dogs,
} from './db/schema'
import { photoExists, photoUrl } from './storage'
import {
  InvalidPayload, isRecord, readBirthDate, readChoices, readPhotoKeys, readText,
} from './validation'

/**
 * Création de chiens, commune à l'onboarding et à l'ajout d'un chien depuis le profil :
 * mêmes champs obligatoires, mêmes vérifications, même enregistrement.
 */

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

/** Lit un chien à créer (étapes 1 à 4 de l'onboarding). */
export function readNewDog(userId: string, value: unknown): OnboardingDog {
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

/**
 * Vérifie ce que la validation du corps ne peut pas voir : photos bien envoyées au stockage
 * (on n'enregistre pas de lien cassé) et races existantes. Renvoie un message d'erreur, ou `null`.
 */
export async function checkNewDogs(newDogs: OnboardingDog[]) {
  const uploaded = await Promise.all(newDogs.flatMap((dog) => dog.photos).map(photoExists))
  if (uploaded.includes(false)) return 'Photo introuvable dans le stockage.'

  const breedIds = [...new Set(newDogs.flatMap((dog) => (dog.breedId ? [dog.breedId] : [])))]
  if (breedIds.length) {
    const known = await db.select({ id: breeds.id }).from(breeds).where(inArray(breeds.id, breedIds))
    if (known.length !== breedIds.length) return 'Race inconnue.'
  }
  return null
}

/** Crée les chiens avec leurs photos, traits et activités, dans la transaction fournie. */
export async function insertDogs(tx: Transaction, ownerId: string, newDogs: OnboardingDog[]) {
  // Les référentiels ne contiennent que les choix déjà utilisés : on ajoute ceux qui manquent
  const traitNames = [...new Set(newDogs.flatMap((dog) => dog.traits))]
  const activityNames = [...new Set(newDogs.flatMap((dog) => dog.activities))]
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
  for (const { traits, activities: dogActivityNames, photos, ...dog } of newDogs) {
    const [{ id }] = await tx.insert(dogs).values({ ownerId, ...dog }).returning({ id: dogs.id })
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
}
