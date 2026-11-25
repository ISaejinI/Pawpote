import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';
import { pressFeedback, type ShadowSize } from './press-feedback';

export type IconButtonVariant = 'primary' | 'surface' | 'pass' | 'like';
export type IconButtonSize = 'lg' | 'md' | 'sm';

export type IconButtonProps = Omit<
  PressableProps,
  'children' | 'style' | 'accessibilityLabel'
> & {
  icon: IconName;
  /** Obligatoire : le bouton n'a pas de texte visible. */
  accessibilityLabel: string;
  /**
   * - `primary` : lime (Envoyer, Proposer une balade, Filtres).
   * - `surface` : cream (Retour).
   * - `pass` : rose (Passer).
   * - `like` : orange, icône crème cerclée d'ink (J'aime).
   */
  variant?: IconButtonVariant;
  /** lg 64 px (swipe) · md 46 px (Retour, Envoyer) · sm 44 px (Filtres). */
  size?: IconButtonSize;
  /** `square` : carré arrondi `radius-sm` (Filtres). */
  shape?: 'circle' | 'square';
  style?: StyleProp<ViewStyle>;
};

type VariantConfig = {
  backgroundColor: string;
  iconColor: string;
  /** Contour ink autour d'une icône pleine. */
  iconOutline?: string;
};

const VARIANTS: Record<IconButtonVariant, VariantConfig> = {
  primary: { backgroundColor: colors.primary, iconColor: colors.text },
  surface: { backgroundColor: colors.surface, iconColor: colors.text },
  pass: { backgroundColor: colors.pass, iconColor: colors.text },
  like: {
    backgroundColor: colors.like,
    iconColor: colors.surface,
    iconOutline: colors.text,
  },
};

const SIZES: Record<
  IconButtonSize,
  { box: number; icon: number; strokeWidth: number }
> = {
  lg: { box: 64, icon: 24, strokeWidth: 3.4 },
  md: { box: 46, icon: 20, strokeWidth: 2.8 },
  sm: { box: 44, icon: 22, strokeWidth: 2.4 },
};

/** Taille et contour d'une icône pleine cerclée (le cœur de J'aime). */
const OUTLINED_ICON_EXTRA_SIZE = 4;
const OUTLINE_WIDTH = 1.6;

export function IconButton({
  icon,
  variant = 'primary',
  size = 'md',
  shape = 'circle',
  disabled,
  style,
  accessibilityState,
  ...rest
}: IconButtonProps) {
  const { backgroundColor, iconColor, iconOutline } = VARIANTS[variant];
  const { box, icon: iconSize, strokeWidth } = SIZES[size];
  const isDisabled = !!disabled;

  // Grand format (swipe) : shadow-md. Action lime moyenne (Envoyer) : shadow-sm.
  // Les autres (Retour, Filtres) n'ont pas d'ombre.
  const shadow: ShadowSize | null =
    size === 'lg' ? 'md' : size === 'md' && variant === 'primary' ? 'sm' : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          width: box,
          height: box,
          backgroundColor,
          borderRadius: shape === 'square' ? radius.sm : radius.pill,
        },
        ...pressFeedback({ shadow, pressed, disabled: isDisabled }),
        style,
      ]}
      {...rest}
    >
      <Icon
        name={icon}
        size={iconOutline ? iconSize + OUTLINED_ICON_EXTRA_SIZE : iconSize}
        color={iconColor}
        strokeWidth={iconOutline ? OUTLINE_WIDTH : strokeWidth}
        outlineColor={iconOutline}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
  },
});
