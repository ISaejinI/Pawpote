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
}
