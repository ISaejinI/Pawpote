import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows } from '@/theme';

import { Icon } from './icon';

export type AvatarProps = {
  uri?: string | null;
  /** Diamètre en px : 42 empilés, 46–54 listes, 62 détail, 96 en-tête de profil. */
  size?: number;
  /** Ajoute l'ombre `shadow-sm`. */
  raised?: boolean;
  /** Décrit la photo (« Photo de Camille »). */
  accessibilityLabel?: string;
  /** Sans photo : silhouette (`user`, par défaut) ou patte (`paw`, pour un chien). */
  fallbackIcon?: 'user' | 'paw';
  /** Sans photo : couleur de fond (lavande par défaut). */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Photo ronde d'un chien ou d'un maître ; sans photo, une icône sur fond coloré. */
export function Avatar({
  uri,
  size = 52,
  raised = false,
  accessibilityLabel,
  fallbackIcon = 'user',
  color,
  style,
}: AvatarProps) {
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.avatar,
        { width: size, height: size },
        color && { backgroundColor: color },
        raised && shadows.sm,
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : (
        <Icon name={fallbackIcon} size={Math.round(size * (fallbackIcon === 'paw' ? 0.4 : 0.42))} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lavender200,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  image: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.pill,
  },
});
