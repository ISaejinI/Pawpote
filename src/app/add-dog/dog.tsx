import { router } from 'expo-router'

import { DogStep } from '@/components/onboarding/dog-step'
import { addDogStepProps } from '@/components/onboarding/steps'

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
