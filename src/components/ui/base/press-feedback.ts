import { StyleSheet, type ViewStyle } from 'react-native';

import { shadows } from '@/theme';

export type ShadowSize = 'sm' | 'md' | 'lg';

/** Décalage (px) de chaque ombre, identique en x et en y. */
const SHADOW_OFFSETS: Record<ShadowSize, number> = { sm: 3, md: 4, lg: 6 };

/**
 * Retour visuel commun aux boutons :
 * - avec ombre : le bouton « s'enfonce » dans son ombre ;
 * - sans ombre : il rétrécit légèrement ;
 * - désactivé : opacité réduite, sans ombre.
 */
export function pressFeedback({
  shadow,
  pressed,
  disabled,
}: {
  shadow: ShadowSize | null;
  pressed: boolean;
  disabled: boolean;
}): (ViewStyle | false | null)[] {
  if (disabled) return [styles.disabled];

  const offset = shadow ? SHADOW_OFFSETS[shadow] : 0;

  return [
    shadow && shadows[shadow],
    pressed &&
      (shadow
        ? {
            boxShadow: 'none',
            transform: [{ translateX: offset }, { translateY: offset }],
          }
        : styles.pressedFlat),
  ];
}

const styles = StyleSheet.create({
  pressedFlat: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
