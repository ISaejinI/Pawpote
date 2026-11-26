/**
 * Contrat de l'enregistrement de l'onboarding, partagé entre l'app et l'API.
 */

/** Traits de caractère proposés (table `characters`). */
export const TRAITS = [
  'Joueur',
  'Calme',
  'Câlin',
  'Timide',
  'Foufou',
  'Curieux',
  'Gourmand',
  'Protecteur',
  'Sociable',
  'Indépendant',
  'Têtu',
  'Bavard',
] as const

/** Activités proposées (table `activities`). */
export const ACTIVITIES = [
  'Balade en forêt',
  'Course',
  'Baignade',
  'Jeu de balle',
  'Randonnée',
  'Parc à chiens',
  'Plage',
  'Agility',
] as const

export const ONBOARDING_LIMITS = {
  dogName: 30,
  /** Limite de la colonne `dogs.favorite_toy`. */
  favoriteToy: 32,
  quirk: 120,
  description: 300,
  address: 120,
  city: 60,
  /** Chiens enregistrables en une fois. */
  dogs: 5,
} as const

export type OnboardingDog = {
  name: string
  sex: 'female' | 'male'
  /** AAAA-MM-JJ */
  birthDate: string
  breedId: number | null
  traits: string[]
  quirk: string
  favoriteToy: string | null
  activities: string[]
  description: string
}

export type OnboardingOwner = {
  /** AAAA-MM-JJ */
  birthDate: string
  address: string
  postalCode: string
  city: string
}

export type OnboardingPayload = {
  owner: OnboardingOwner
  dogs: OnboardingDog[]
}

export type OnboardingStatus = { completed: boolean }
