import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { Chip, FormField, Input, OnboardingStepPage } from '@/components/ui'
import { ONBOARDING_LIMITS, TRAITS } from '@/data/onboarding-options'
import { toggleValue, useOnboardingDraft } from '@/lib/onboarding-draft'

import type { DogStepProps } from './dog-step-props'

/** Étape 3 · Son caractère */
export function CharacterStep({ progress, onNext, onBack, continueLabel, continueLoading }: DogStepProps) {
  const { dog, updateDog } = useOnboardingDraft()
  const [showErrors, setShowErrors] = useState(false)
  const missingTrait = dog.traits.length === 0
  const missingQuirk = !dog.quirk.trim()

  function handleContinue() {
    if (missingTrait || missingQuirk) {
      setShowErrors(true)
      return
    }
    onNext()
  }

  return (
    <OnboardingStepPage
      {...progress}
      title="Son caractère"
      subtitle="Choisis tout ce qui lui ressemble"
      onBack={onBack}
      onContinue={handleContinue}
      continueLabel={continueLabel}
      continueLoading={continueLoading}
    >
      <FormField label="Ce qui lui ressemble" error={showErrors && missingTrait ? 'Choisis au moins un trait de caractère.' : undefined}>
        <View style={styles.chips}>
          {TRAITS.map((trait) => (
            <Chip
              key={trait}
              label={trait}
              color="pink"
              selected={dog.traits.includes(trait)}
              onPress={() => {
                updateDog({ traits: toggleValue(dog.traits, trait) })
              }}
            />
          ))}
        </View>
      </FormField>

      <FormField
        label="Sa petite particularité"
        error={showErrors && missingQuirk ? 'Raconte-nous une petite habitude de ton chien.' : undefined}
      >
        <Input
          placeholder="Ex. Boude si la balade est trop courte"
          value={dog.quirk}
          onChangeText={(quirk) => updateDog({ quirk })}
          maxLength={ONBOARDING_LIMITS.quirk}
        />
      </FormField>

      <FormField label="Son jouet préféré" optional>
        <Input
          placeholder="Ex. La poule qui couine"
          value={dog.favoriteToy}
          onChangeText={(favoriteToy) => updateDog({ favoriteToy })}
          maxLength={ONBOARDING_LIMITS.favoriteToy}
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
})
