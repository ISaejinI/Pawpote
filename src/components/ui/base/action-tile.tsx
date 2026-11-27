import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';

export type ActionTileColor = 'lavender' | 'lime';

export type ActionTileProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: IconName;
  title: string;
  /** Précision sous le titre, sur une ou deux lignes. */
  subtitle?: string;
  color?: ActionTileColor;
  /** Inclinaison en degrés (±1,5° dans la modale photo). */
  rotate?: number;
  style?: StyleProp<ViewStyle>;
};

const BACKGROUNDS: Record<ActionTileColor, string> = {
  lavender: colors.lavender200,
  lime: colors.lime500,
};

/** Ombre `shadow-md` : 4 px de décalage. */
const SHADOW_OFFSET = 4;

/** Grande tuile de choix, légèrement inclinée (Galerie, Caméra). */
export function ActionTile({
  icon,
  title,
  subtitle,
  color = 'lavender',
  rotate = 0,
  disabled,
  style,
  ...rest
}: ActionTileProps) {
  const isDisabled = !!disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: BACKGROUNDS[color] },
        // Enfoncement dans l'ombre, en gardant l'inclinaison
        pressed
          ? {
              boxShadow: 'none',
              transform: [
                { translateX: SHADOW_OFFSET },
                { translateY: SHADOW_OFFSET },
                { rotate: `${rotate}deg` },
              ],
            }
          : { transform: [{ rotate: `${rotate}deg` }] },
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <View style={styles.bubble}>
        <Icon name={icon} size={34} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  disabled: {
    opacity: 0.5,
    boxShadow: 'none',
  },
  bubble: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  title: {
    ...typography.button,
    color: colors.text,
  },
  subtitle: {
    ...typography.small,
    lineHeight: 16,
    color: colors.text,
    textAlign: 'center',
  },
});
