import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { SwipeDeck } from '@/components/swipe/swipe-deck'
import { useTapbarInset } from '@/components/ui'
import { mockDogs } from '@/data/mock-dogs'
import { colors, spacing, typography } from '@/theme'

export default function MatchScreen() {
  const tapbarInset = useTapbarInset()

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { paddingBottom: tapbarInset }]}
    >
      <Text style={styles.title}>Découvrir</Text>

      <View style={styles.content}>
        <SwipeDeck dogs={mockDogs} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing[5],
  },
  title: {
    ...typography.titleXl,
    color: colors.text,
    paddingTop: spacing[5],
  },
  content: {
    flex: 1,
  },
})
