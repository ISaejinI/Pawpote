import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, palette } from '@/theme';

const ARTWORK = {
  mark: { source: require('@/assets/branding/pawpote-mark.webp'), aspectRatio: 1 },
  horizontal: { source: require('@/assets/branding/pawpote-horizontal.webp'), aspectRatio: 1920 / 819 },
  stacked: { source: require('@/assets/branding/pawpote-stacked.webp'), aspectRatio: 1 },
} as const;

export type LogoProps = {
  /**
   * - `sticker` : boîte cream inclinée (chargement, connexion).
   * - `inline` : logo sans boîte (en-têtes).
   */
  variant?: 'sticker' | 'inline';
  layout?: keyof typeof ARTWORK;
  /** Taille du sticker : `md` (connexion) ou `lg` (chargement). */
  size?: 'md' | 'lg';
  /** Largeur du logo en px, à la place de celle donnée par `size`. */
  width?: number;
  style?: StyleProp<ViewStyle>;
};

export function Logo({ variant = 'sticker', layout = 'horizontal', size = 'md', width: customWidth, style }: LogoProps) {
  const artwork = ARTWORK[layout];
  const width = customWidth ?? (layout === 'horizontal' ? (size === 'lg' ? 184 : 132) : (size === 'lg' ? 116 : 76));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="PawPote"
      style={[styles.row, variant === 'sticker' && styles.sticker, style]}
    >
      <Image source={artwork.source} contentFit="contain" style={{ width, aspectRatio: artwork.aspectRatio }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'center',
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
});
