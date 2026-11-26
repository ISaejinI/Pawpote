import { router } from 'expo-router'

import { PhotoStep } from '@/components/onboarding/photo-step'
import { addDogStepProps } from '@/components/onboarding/steps'

/** Ajout d'un chien · étape 2 sur 4. */
export default function AddDogPhotoStep() {
  return (
    <PhotoStep
      progress={addDogStepProps(2)}
      onNext={() => router.push('/add-dog/character')}
      onBack={() => router.back()}
    />
  )
}
