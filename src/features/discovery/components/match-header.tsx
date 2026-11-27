import { StyleSheet, View } from 'react-native'

import { IconButton, Logo } from '@/components/ui'
import { borderWidth, colors, radius, spacing } from '@/theme'

export function MatchHeader({ onFilters, disabled }: { onFilters: () => void; disabled: boolean }) {
  return (
    <View style={styles.frame}>
      <View pointerEvents="none" style={styles.shadow} />
      <View style={styles.bar}>
        <Logo layout="horizontal" variant="inline" />
        <IconButton
          icon="filters"
          shape="square"
          size="sm"
          accessibilityLabel="Ouvrir les filtres"
          accessibilityHint="Ouvre les filtres de découverte"
          disabled={disabled}
          onPress={onFilters}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    paddingRight: 5,
    paddingBottom: 5,
  },
  shadow: {
    ...StyleSheet.absoluteFill,
    left: 5,
    top: 5,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.lg,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
})
