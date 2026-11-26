import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert } from 'react-native'

import { ActivitiesStep } from '@/components/onboarding/activities-step'
import { addDogStepProps } from '@/components/onboarding/steps'
import { dogPhotoUris, toOnboardingDog, uploadMissingPhotos } from '@/lib/onboarding-api'
import { useOnboardingDraft } from '@/lib/onboarding-draft'
import { addDog } from '@/lib/profile-api'

/** Ajout d'un chien · étape 4 sur 4 : enregistre le chien puis revient au profil. */
export default function AddDogActivitiesStep() {
  const { dog } = useOnboardingDraft()
  const [saving, setSaving] = useState(false)
  // Photos déjà envoyées (URI locale → clé) : un nouvel essai ne les renvoie pas
  const uploadedPhotos = useRef(new Map<string, string>())

  async function handleSave() {
    if (saving) return
    setSaving(true)

    try {
      await uploadMissingPhotos(dogPhotoUris(dog), uploadedPhotos.current)
      await addDog(toOnboardingDog(dog, uploadedPhotos.current))
      // L'onglet Profil se recharge en revenant au premier plan
      router.dismissTo('/profile')
    } catch (error) {
      console.error('Add dog error:', error)
      setSaving(false)
      Alert.alert(
        `Impossible d’ajouter ${dog.name.trim() || 'ce chien'}`,
        'Vérifie ta connexion, puis réessaie.',
      )
    }
  }

  return (
    <ActivitiesStep
      progress={addDogStepProps(4)}
      onNext={handleSave}
      onBack={() => router.back()}
      continueLabel={`Ajouter ${dog.name.trim() || 'ce chien'}`}
      continueLoading={saving}
    />
  )
}
