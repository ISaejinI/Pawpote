import { router } from 'expo-router'

import { CharacterStep } from '@/features/onboarding/components/character-step'
import { stepProps } from '@/features/onboarding/steps'

/** Onboarding · étape 3 sur 6. */
export default function OnboardingCharacterStep() {
  return (
    <CharacterStep
      progress={stepProps(3)}
      onNext={() => router.push('/onboarding/activities')}
      onBack={() => router.back()}
    />
  )
}
