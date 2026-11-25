import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';
import { pressFeedback, type ShadowSize } from './press-feedback';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  /** Libellé du bouton. */
  children: string;
  /**
   * - `primary` : lime, une seule action principale par écran.
   * - `secondary` : blanc (ou cream via `background`), sans ombre.
   * - `danger` : cream, texte danger. Toujours isolé en bas de page.
   */
  variant?: ButtonVariant;
  /** Hauteur : lg 58 · md 52 · sm 46 · xs 40 px. */
  size?: ButtonSize;
  /** Fond du bouton secondaire : `cream` quand il est posé sur une surface cream. */
  background?: 'white' | 'cream';
  /** Icône, rendue dans la couleur du texte. */
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const HEIGHTS: Record<ButtonSize, number> = { lg: 58, md: 52, sm: 46, xs: 40 };

/** Cible tactile minimale (px). */
const MIN_TOUCH_TARGET = 44;

const ICON_SIZE = 20;

export function Button({
  children,
  variant = 'primary',
  size = variant === 'primary' ? 'lg' : 'md',
  background = 'white',
  icon,
  iconPosition = 'start',
  loading = false,
  disabled,
  style,
  accessibilityState,
  ...rest
}: ButtonProps) {
  const isDisabled = !!disabled || loading;
  const height = HEIGHTS[size];
  const textColor = variant === 'danger' ? colors.danger : colors.text;

  // Seul le bouton principal porte une ombre : md en grand, sm en compact
  const shadow: ShadowSize | null =
    variant === 'primary' ? (size === 'lg' || size === 'md' ? 'md' : 'sm') : null;

  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.surface
        : background === 'cream'
          ? colors.surface
          : colors.field;

  // Complète la zone tactile des boutons de moins de 44 px
  const slop = Math.max(0, Math.ceil((MIN_TOUCH_TARGET - height) / 2));

  const iconNode = icon ? (
    <Icon name={icon} size={ICON_SIZE} color={textColor} />
  ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={slop || undefined}
      style={({ pressed }) => [
        styles.base,
        { height, backgroundColor },
        ...pressFeedback({ shadow, pressed, disabled: isDisabled }),
        style,
      ]}
      {...rest}
    >
      {/* Le contenu reste en place (invisible) pendant le chargement pour garder la largeur */}
      <View style={[styles.content, loading && styles.hidden]}>
        {iconPosition === 'start' && iconNode}
        <Text
          style={[
            size === 'lg' ? typography.button : styles.textCompact,
            { color: textColor },
          ]}
          numberOfLines={1}
        >
          {children}
        </Text>
        {iconPosition === 'end' && iconNode}
      </View>

      {loading && (
        <ActivityIndicator style={StyleSheet.absoluteFill} color={textColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hidden: {
    opacity: 0,
  },
  textCompact: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 18,
  },
});
