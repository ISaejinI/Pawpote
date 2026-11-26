import { router } from 'expo-router'

import { DogStep } from '@/components/onboarding/dog-step'
import { stepProps } from '@/components/onboarding/steps'

/** Onboarding · étape 1 sur 6. */
export default function OnboardingDogStep() {
  return (
    <DogStep
      progress={stepProps(1)}
      onNext={() => router.push('/onboarding/photo')}
    />
  )
}
