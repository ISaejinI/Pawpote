import { Image } from 'expo-image';
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

import { Icon } from '../base/icon';
import { pressFeedback } from '../base/press-feedback';

export type PhotoSlotVariant = 'main' | 'thumb' | 'avatar';

export type PhotoSlotProps = Omit<PressableProps, 'children' | 'style' | 'accessibilityLabel'> & {
  /**
   * - `main` : photo principale du chien, grand emplacement pêche.
   * - `thumb` : photo secondaire, vignette de 96 px.
   * - `avatar` : photo ronde du maître, 84 px.
   */
  variant: PhotoSlotVariant;
  /** Photo choisie ; sans photo, l'emplacement est en pointillés. */
  uri?: string | null;
  /** Texte de l'emplacement principal vide. */
  title?: string;
  subtitle?: string;
  /** Obligatoire : décrit l'action (« Ajouter sa photo principale »). */
  accessibilityLabel: string;
  /** Erreur : contour `danger`. */
  invalid?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Emplacement photo cliquable, vide en pointillés ou rempli par la photo choisie. */
export function PhotoSlot({
  variant,
  uri,
  title,
  subtitle,
  invalid = false,
  disabled,
  style,
  ...rest
}: PhotoSlotProps) {
  const isDisabled = !!disabled;
  const filled = !!uri;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        filled && styles.filled,
        invalid && styles.invalid,
        ...pressFeedback({ shadow: null, pressed, disabled: isDisabled }),
        style,
      ]}
      {...rest}
    >
      {filled ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : variant === 'main' ? (
        <>
          <View style={styles.cameraBubble}>
            <Icon name="camera" size={30} strokeWidth={1.8} />
          </View>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </>
      ) : (
        <Icon
          name={variant === 'avatar' ? 'camera' : 'plus'}
          size={variant === 'avatar' ? 28 : 24}
          strokeWidth={variant === 'avatar' ? 1.8 : 2.8}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  main: {
    flexGrow: 1,
    minHeight: 260,
    gap: 10,
    padding: 16,
    backgroundColor: colors.peach300,
    borderRadius: radius.lg,
  },
  thumb: {
    height: 96,
    backgroundColor: colors.field,
    borderRadius: 18,
  },
  avatar: {
    width: 84,
    height: 84,
    backgroundColor: colors.lavender200,
    borderRadius: radius.pill,
  },
  filled: {
    padding: 0,
    borderStyle: 'solid',
  },
  invalid: {
    borderColor: colors.danger,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  cameraBubble: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
    ...shadows.sm,
  },
  title: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.label,
    fontWeight: 500,
    color: colors.text,
    textAlign: 'center',
  },
});
