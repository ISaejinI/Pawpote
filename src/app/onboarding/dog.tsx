import { router } from 'expo-router'

import { DogStep } from '@/features/onboarding/components/dog-step'
import { stepProps } from '@/features/onboarding/steps'

/** Onboarding · étape 1 sur 6. */
export default function OnboardingDogStep() {
  return (
    <DogStep
      progress={stepProps(1)}
      onNext={() => router.push('/onboarding/photo')}
    />
  )
}
