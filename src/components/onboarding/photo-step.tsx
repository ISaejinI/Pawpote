import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  Callout,
  FormField,
  OnboardingStepPage,
  PhotoSlot,
  PhotoSourceSheet,
} from '@/components/ui'
import { useOnboardingDraft } from '@/lib/onboarding-draft'
import { pickImage, type ImageSource } from '@/lib/pick-image'
import { colors, spacing, typography } from '@/theme'

import type { DogStepProps } from './dog-step-props'

/** Emplacement visé par la modale : la photo principale ou une vignette (0 à 2). */
type PhotoTarget = 'main' | number

/** Étape 2 · Sa photo */
export function PhotoStep({ progress, onNext, onBack, continueLabel, continueLoading }: DogStepProps) {
  const { dog, updateDog } = useOnboardingDraft()
  const [error, setError] = useState('')

  // La cible reste en mémoire pendant l'animation de fermeture de la modale
  const [sheetOpen, setSheetOpen] = useState(false)
  const [target, setTarget] = useState<PhotoTarget>('main')

  const targetUri = target === 'main' ? dog.mainPhoto : dog.extraPhotos[target]

  function openSheet(next: PhotoTarget) {
    setTarget(next)
    setSheetOpen(true)
  }

  function setTargetPhoto(uri: string | null) {
    if (target === 'main') {
      updateDog({ mainPhoto: uri })
      if (uri) setError('')
    } else {
      updateDog({ extraPhotos: dog.extraPhotos.map((photo, i) => (i === target ? uri : photo)) })
    }
  }

  async function handleSelect(source: ImageSource) {
    const uri = await pickImage({ source, aspect: target === 'main' ? [3, 4] : [1, 1] })
    if (uri) setTargetPhoto(uri)
  }

  function handleContinue() {
    if (!dog.mainPhoto) {
      setError('Ajoute sa photo principale pour continuer.')
      return
    }
    onNext()
  }

  const dogName = dog.name.trim() || 'ton chien'

  return (
    <OnboardingStepPage
      {...progress}
      title="Sa plus belle photo"
      subtitle="Fais-lui prendre la pose"
      onBack={onBack}
      onContinue={handleContinue}
      continueLabel={continueLabel}
      continueLoading={continueLoading}
    >
      <View style={styles.main}>
        <PhotoSlot
          variant="main"
          uri={dog.mainPhoto}
          title="Ajouter sa photo principale"
          subtitle="Elle sera affichée en grand sur sa carte"
          accessibilityLabel={dog.mainPhoto ? 'Changer sa photo principale' : 'Ajouter sa photo principale'}
          invalid={!!error}
          onPress={() => openSheet('main')}
        />
        {error ? (
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>

      <FormField label="D’autres photos" optional>
        <View style={styles.thumbs}>
          {dog.extraPhotos.map((uri, index) => (
            <PhotoSlot
              key={index}
              variant="thumb"
              uri={uri}
              accessibilityLabel={uri ? `Changer la photo ${index + 2}` : 'Ajouter une autre photo'}
              onPress={() => openSheet(index)}
              style={styles.thumb}
            />
          ))}
        </View>
      </FormField>

      <Callout variant="tip">Astuce : une photo lumineuse, où on voit bien sa bouille !</Callout>

      <PhotoSourceSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={handleSelect}
        onDelete={targetUri ? () => setTargetPhoto(null) : undefined}
        title={targetUri ? 'Changer la photo' : 'Ajouter une photo'}
        subtitle={
          targetUri ? `Une nouvelle bouille pour ${dogName} ?` : 'Montre-nous sa plus belle bouille'
        }
      />
    </OnboardingStepPage>
  )
}

const styles = StyleSheet.create({
  main: {
    flexGrow: 1,
    gap: 6,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    paddingHorizontal: spacing[1],
  },
  thumbs: {
    flexDirection: 'row',
    gap: 10,
  },
  thumb: {
    flex: 1,
  },
})
