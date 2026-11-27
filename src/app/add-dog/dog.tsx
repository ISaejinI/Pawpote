import { router } from 'expo-router'

import { DogStep } from '@/features/onboarding/components/dog-step'
import { addDogStepProps } from '@/features/onboarding/steps'

/** Ajout d'un chien · étape 1 sur 4. Le retour ramène au profil. */
export default function AddDogIdentityStep() {
  return (
    <DogStep
      progress={addDogStepProps(1)}
      onNext={() => router.push('/add-dog/photo')}
      onBack={() => router.back()}
    />
  )
}
