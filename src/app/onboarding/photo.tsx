import { router } from 'expo-router'

import { PhotoStep } from '@/features/onboarding/components/photo-step'
import { stepProps } from '@/features/onboarding/steps'

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
