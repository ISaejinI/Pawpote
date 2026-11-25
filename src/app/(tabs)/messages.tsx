import { StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTapbarInset } from '@/components/ui'
import { colors, spacing, typography } from '@/theme'

export default function MessagesScreen() {
  const tapbarInset = useTapbarInset()

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { paddingBottom: tapbarInset }]}
    >
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.hint}>Tes conversations arrivent bientôt.</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  title: {
    ...typography.titleXl,
    color: colors.text,
    paddingTop: spacing[5],
  },
  hint: {
    ...typography.hand,
    color: colors.text,
  },
})
