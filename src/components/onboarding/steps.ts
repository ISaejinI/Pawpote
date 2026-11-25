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
