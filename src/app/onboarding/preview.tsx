import { router } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DogPreviewCard } from '@/components/onboarding/dog-preview-card'
import { Button, TextLink, WaveBackground } from '@/components/ui'
import { ageInYears, parseDateInput } from '@/lib/dates'
import { useOnboardingDraft } from '@/lib/onboarding-draft'
import { useOnboardingStatus } from '@/lib/onboarding-status'
import { colors, spacing, typography } from '@/theme'

function formatAge(birthDate: string) {
  const date = parseDateInput(birthDate)
  if (!date) return undefined
  const years = ageInYears(date)
  return years < 1 ? 'Bébé' : `${years}\n${years > 1 ? 'ans' : 'an'}`
}

/** Fin de l'onboarding : aperçu de la carte du chien. */
export default function PreviewScreen() {
  const insets = useSafeAreaInsets()
  const { dog, startNewDog } = useOnboardingDraft()
  const { completeOnboarding } = useOnboardingStatus()

  return (
    <View style={styles.root}>
      <WaveBackground />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing[5], paddingBottom: insets.bottom + spacing[6] },
        ]}
      >
        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            Tout est prêt !
          </Text>
          <Text style={styles.subtitle}>Voilà comment les autres verront {dog.name}</Text>
        </View>

        <DogPreviewCard
          name={dog.name}
          age={formatAge(dog.birthDate)}
          breed={dog.breed ?? undefined}
          photoUri={dog.mainPhoto}
        />

        <View style={styles.actions}>
          {/* La garde du layout racine bascule alors vers les onglets */}
          <Button icon="arrow-right" iconPosition="end" onPress={completeOnboarding}>
            Commencer à swiper
          </Button>
          <Button
            variant="secondary"
            background="cream"
            icon="plus"
            onPress={() => {
              startNewDog()
              router.dismissTo('/onboarding/dog')
            }}
          >
            Ajouter un autre chien
          </Button>
          <TextLink onPress={() => router.dismissTo('/onboarding/dog')}>Modifier son profil</TextLink>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[4],
  },
  heading: {
    alignItems: 'center',
    gap: 2,
  },
  title: {
    ...typography.titleXl,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.handLg,
    color: colors.text,
    textAlign: 'center',
  },
  actions: {
    marginTop: 'auto',
    paddingTop: spacing[4],
    gap: spacing[3],
  },
})
