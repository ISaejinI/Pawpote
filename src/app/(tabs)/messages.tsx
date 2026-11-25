import { StyleSheet, Text, View } from 'react-native'

import { TabPage } from '@/components/ui'
import { borderWidth, colors, radius, shadows, spacing, typography } from '@/theme'

export default function MessagesScreen() {
  return (
    <TabPage title="Messages">
      {/* Le contenu est toujours posé dans une boîte unie, jamais directement sur les vagues */}
      <View style={styles.card}>
        <Text style={styles.hint}>Tes conversations arrivent bientôt.</Text>
      </View>
    </TabPage>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing[4],
    ...shadows.md,
  },
  hint: {
    ...typography.hand,
    color: colors.text,
  },
})
