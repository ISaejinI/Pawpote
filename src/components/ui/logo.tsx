import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, palette, typography } from '@/theme';

import { Icon } from './icon';

export type LogoProps = {
  /**
   * - `sticker` : boîte cream inclinée (chargement, connexion).
   * - `inline` : patte + mot, sans boîte (en-têtes).
   */
  variant?: 'sticker' | 'inline';
  /** Taille du sticker : `md` (connexion) ou `lg` (chargement). */
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

const SIZES = {
  inline: { paw: 28, text: 26 },
  md: { paw: 32, text: 36 },
  lg: { paw: 44, text: 52 },
} as const;

/** La patte mandarin suivie de « PawPote ». Tracé provisoire, en attendant le logo définitif. */
export function Logo({ variant = 'sticker', size = 'md', style }: LogoProps) {
  const { paw, text } = SIZES[variant === 'inline' ? 'inline' : size];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="PawPote"
      style={[styles.row, variant === 'sticker' && styles.sticker, style]}
    >
      <Icon name="logo-paw" size={paw} />
      <Text style={[styles.word, { fontSize: text, lineHeight: text }]}>PawPote</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
  },
  sticker: {
    paddingTop: 6,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 18,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.sticker,
    borderColor: colors.white,
    borderRadius: 22,
    // Contour ink autour du contour blanc + ombre décalée
    boxShadow: `0 0 0 2.5px ${palette.ink}, 5px 5px 0 2.5px ${palette.ink}`,
    transform: [{ rotate: '-4deg' }],
  },
  word: {
    fontFamily: typography.logo.fontFamily,
    color: colors.text,
  },
});
