import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { stepProps } from '@/components/onboarding/steps'
import { FormField, Input, OnboardingStepPage, ParkRow } from '@/components/ui'
import { MOCK_PARKS } from '@/data/onboarding-options'
import { toggleValue, useOnboardingDraft } from '@/lib/onboarding-draft'
import { colors, typography } from '@/theme'

const DOT_COLORS = [colors.lime500, colors.pink300, colors.lavender200, colors.peach300]

/** Étape 5 · Vos balades (facultative) */
export default function ParksStep() {
  const { parks, setParks } = useOnboardingDraft()
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const visibleParks = MOCK_PARKS.filter(
    (park) => !normalizedQuery || park.name.toLowerCase().includes(normalizedQuery),
  )

  function goNext() {
    router.push('/onboarding/owner')
  }

  return (
    <OnboardingStepPage
      {...stepProps(5)}
      title="Vos balades"
      subtitle="Où avez-vous vos habitudes ?"
      onBack={router.back}
      onContinue={goNext}
      onSkip={goNext}
    >
      <FormField label="Rechercher un parc">
        <Input
          placeholder="Nom du parc, quartier…"
          value={query}
          onChangeText={setQuery}
          icon="search"
          autoCorrect={false}
          returnKeyType="search"
        />
      </FormField>

      <View style={styles.list}>
        <Text style={styles.label}>Près de chez toi</Text>
        {visibleParks.map((park) => (
          <ParkRow
            key={park.id}
            name={park.name}
            distance={park.distance}
            dotColor={DOT_COLORS[MOCK_PARKS.indexOf(park) % DOT_COLORS.length]}
            selected={parks.includes(park.id)}
            onToggle={() => setParks(toggleValue(parks, park.id))}
          />
        ))}
        {visibleParks.length === 0 && <Text style={styles.empty}>Aucun parc trouvé.</Text>}
      </View>

      <Text style={styles.hand}>
        On te proposera en priorité des chiens qui fréquentent les mêmes parcs.
      </Text>
    </OnboardingStepPage>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  empty: {
    ...typography.label,
    fontWeight: 500,
    color: colors.text,
  },
  hand: {
    ...typography.hand,
    color: colors.text,
  },
})
