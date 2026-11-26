import { router } from 'expo-router'

import { PhotoStep } from '@/components/onboarding/photo-step'
import { stepProps } from '@/components/onboarding/steps'

/** Onboarding · étape 2 sur 6. */
export default function OnboardingPhotoStep() {
  return (
    <PhotoStep
      progress={stepProps(2)}
      onNext={() => router.push('/onboarding/character')}
      onBack={() => router.back()}
    />
  )
}
