import { router } from 'expo-router'

import { CharacterStep } from '@/components/onboarding/character-step'
import { addDogStepProps } from '@/components/onboarding/steps'

/** Ajout d'un chien · étape 3 sur 4. */
export default function AddDogCharacterStep() {
  return (
    <CharacterStep
      progress={addDogStepProps(3)}
      onNext={() => router.push('/add-dog/activities')}
      onBack={() => router.back()}
    />
  )
}
