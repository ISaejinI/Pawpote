import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { stepProps } from '@/components/onboarding/steps'
import { Chip, FormField, OnboardingStepPage, TextArea } from '@/components/ui'
import { ACTIVITIES } from '@/data/onboarding-options'
import { toggleValue, useOnboardingDraft } from '@/lib/onboarding-draft'

const DESCRIPTION_MAX_LENGTH = 300

/** Étape 4 · Ce qu'il aime */
export default function ActivitiesStep() {
  const { dog, updateDog } = useOnboardingDraft()
  const [error, setError] = useState('')

  function handleContinue() {
    if (!dog.description.trim()) {
      setError('Écris quelques mots sur ton chien.')
      return
    }
    router.push('/onboarding/parks')
  }

  return (
    <OnboardingStepPage
      {...stepProps(4)}
      title="Ce qu’il aime"
      subtitle="Raconte-nous ses petits bonheurs"
      onBack={router.back}
      onContinue={handleContinue}
    >
      <FormField label="Ses activités préférées" optional>
        <View style={styles.chips}>
          {ACTIVITIES.map((activity) => (
            <Chip
              key={activity}
              label={activity}
              color="lime"
              selected={dog.activities.includes(activity)}
              onPress={() => updateDog({ activities: toggleValue(dog.activities, activity) })}
            />
          ))}
        </View>
      </FormField>

      <FormField label="Sa description" error={error} style={styles.grow}>
        <TextArea
          placeholder="Parle-nous de lui en quelques mots : son rythme de balade, ce qu’il adore, ce qu’il évite…"
          value={dog.description}
          onChangeText={(description) => {
            updateDog({ description })
            setError('')
          }}
          maxLength={DESCRIPTION_MAX_LENGTH}
          style={styles.grow}
        />
      </FormField>
    </OnboardingStepPage>
  )
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grow: {
    flexGrow: 1,
  },
})
