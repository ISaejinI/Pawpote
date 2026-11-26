import { Stack } from 'expo-router'

import { OnboardingDraftProvider } from '@/lib/onboarding-draft'

/** Ajout d'un chien depuis le profil : les étapes 1 à 4 de l'onboarding, avec leur propre brouillon. */
export default function AddDogLayout() {
  return (
    <OnboardingDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingDraftProvider>
  )
}
