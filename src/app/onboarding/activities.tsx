import { router } from 'expo-router'

import { ActivitiesStep } from '@/components/onboarding/activities-step'
import { stepProps } from '@/components/onboarding/steps'

/** Onboarding · étape 4 sur 6. */
export default function OnboardingActivitiesStep() {
  return (
    <ActivitiesStep
      progress={stepProps(4)}
      onNext={() => router.push('/onboarding/parks')}
      onBack={() => router.back()}
    />
  )
}
