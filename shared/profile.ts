/** Réponse de `GET /api/profile` : de quoi remplir l'en-tête de l'onglet Profil. */
export type ProfileSummary = {
  owner: {
    firstName: string
    /** URL publique de la photo, ou `null`. */
    photo: string | null
  }
  /** Mes chiens, du plus ancien au plus récent. */
  dogs: ProfileDog[]
}

export type ProfileDog = {
  id: string
  name: string
  breed: string | null
  /** Âge en années révolues, ou `null` sans date de naissance. */
  age: number | null
  /** Photo principale (URL publique), ou `null`. */
  photo: string | null
  /** Part de la fiche remplie, entre 0 et 1. */
  completion: number
}

/** Réponse de `GET /api/profile/dogs/:id` : la fiche complète d'un de mes chiens. */
export type DogSheet = {
  id: string
  name: string
  sex: 'female' | 'male' | null
  /** AAAA-MM-JJ, ou `null`. */
  birthDate: string | null
  breed: { id: number; name: string } | null
  traits: string[]
  quirk: string | null
  favoriteToy: string | null
  activities: string[]
  description: string | null
  /** URL publiques, la photo principale en premier. */
  photos: string[]
  /** Faux pour mon dernier chien : un compte garde toujours au moins un chien. */
  canRemove: boolean
}

/** Corps de `POST /api/profile/dogs/:id` : la fiche modifiée. */
export type DogUpdate = {
  name: string
  sex: 'female' | 'male'
  /** AAAA-MM-JJ */
  birthDate: string
  breedId: number | null
  traits: string[]
  quirk: string | null
  favoriteToy: string | null
  activities: string[]
  description: string | null
  /**
   * Photos dans l'ordre, la principale en premier : URL d'une photo déjà enregistrée
   * pour ce chien, ou clé d'une photo tout juste envoyée au stockage.
   */
  photos: string[]
}

/** Ce que regarde la complétion d'une fiche. Le nom n'y figure pas : il est obligatoire. */
export type CompletionInput = {
  hasPhoto: boolean
  hasBreed: boolean
  hasBirthDate: boolean
  hasSex: boolean
  traitCount: number
  quirk: string | null
  favoriteToy: string | null
  activityCount: number
  description: string | null
}

export type CompletionItem =
  | 'photo' | 'breed' | 'birthDate' | 'sex' | 'traits' | 'quirk' | 'favoriteToy' | 'activities' | 'description'

/** Libellés des pastilles « Il manque encore ». */
export const COMPLETION_LABELS: Record<CompletionItem, string> = {
  photo: 'Sa photo principale',
  breed: 'Sa race',
  birthDate: 'Sa date de naissance',
  sex: 'Son sexe',
  traits: 'Son caractère',
  quirk: 'Sa petite particularité',
  favoriteToy: 'Son jouet préféré',
  activities: 'Ses activités préférées',
  description: 'Sa description',
}

const filled = (text: string | null) => !!text?.trim()

/** Part de la fiche remplie (0 à 1) et éléments manquants, dans l'ordre de la fiche. */
export function dogCompletion(input: CompletionInput) {
  const checks: [CompletionItem, boolean][] = [
    ['photo', input.hasPhoto],
    ['sex', input.hasSex],
    ['birthDate', input.hasBirthDate],
    ['breed', input.hasBreed],
    ['traits', input.traitCount > 0],
    ['quirk', filled(input.quirk)],
    ['favoriteToy', filled(input.favoriteToy)],
    ['activities', input.activityCount > 0],
    ['description', filled(input.description)],
  ]
  const missing = checks.filter(([, done]) => !done).map(([item]) => item)
  return { value: (checks.length - missing.length) / checks.length, missing }
}
