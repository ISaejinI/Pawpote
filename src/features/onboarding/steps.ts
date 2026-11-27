/** Nombre d'étapes affiché dans l'en-tête (l'aperçu final n'en fait pas partie). */
export const ONBOARDING_TOTAL_STEPS = 6

/** Nom court de chaque étape, dans l'ordre. */
export const ONBOARDING_STEP_LABELS = [
  'Ton chien',
  'Sa photo',
  'Son caractère',
  'Ce qu’il aime',
  'Vos balades',
  'Et toi ?',
] as const

/** Props communes de l'en-tête d'une étape (numérotée à partir de 1). */
export function stepProps(step: number) {
  return {
    step,
    total: ONBOARDING_TOTAL_STEPS,
    stepLabel: ONBOARDING_STEP_LABELS[step - 1],
  }
}

/** Ajout d'un chien depuis le profil : les étapes 1 à 4 de l'onboarding, seules. */
export const ADD_DOG_TOTAL_STEPS = 4

export function addDogStepProps(step: number) {
  return {
    step,
    total: ADD_DOG_TOTAL_STEPS,
    stepLabel: ONBOARDING_STEP_LABELS[step - 1],
  }
}
