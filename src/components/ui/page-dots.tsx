import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

export type PageDotsProps = {
  count: number;
  /** Page affichée, à partir de 0. */
  index: number;
  style?: StyleProp<ViewStyle>;
};

/** Indicateur de pages d'un carrousel de photos : le point actif s'allonge. */
export function PageDots({ count, index, style }: PageDotsProps) {
  if (count < 2) return null;

  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityLabel={`Photo ${index + 1} sur ${count}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 8,
    backgroundColor: colors.lavender200,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  active: {
    width: 26,
    backgroundColor: colors.surface,
  },
});
