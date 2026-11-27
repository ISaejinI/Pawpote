import { router } from 'expo-router'

import { PhotoStep } from '@/features/onboarding/components/photo-step'
import { addDogStepProps } from '@/features/onboarding/steps'

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
