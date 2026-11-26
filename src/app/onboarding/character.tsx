import { router } from 'expo-router'

import { CharacterStep } from '@/components/onboarding/character-step'
import { stepProps } from '@/components/onboarding/steps'

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
