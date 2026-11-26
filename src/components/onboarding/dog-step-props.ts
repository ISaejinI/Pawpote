/** Position d'une étape dans son parcours (« 2 / 4 · Sa photo »). */
export type StepProgress = {
  step: number
  total: number
  stepLabel: string
}

/**
 * Props communes des étapes de présentation d'un chien (1 à 4), partagées par
 * l'onboarding et l'ajout d'un chien depuis le profil.
 */
export type DogStepProps = {
  progress: StepProgress
  /** Étape validée : passe à la suivante (ou enregistre, à la dernière). */
  onNext: () => void
  /** Sans `onBack`, pas de bouton retour. */
  onBack?: () => void
  /** Libellé du bouton (« Continuer » par défaut). */
  continueLabel?: string
  /** Enregistrement en cours : bouton en chargement. */
  continueLoading?: boolean
}
