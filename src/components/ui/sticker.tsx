import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { borderWidth, colors, palette, radius, typography } from '@/theme';

import { Icon } from './icon';

export type StickerVariant = 'name' | 'age' | 'breed' | 'bubble';
export type StickerSize = 'sm' | 'md';

export type StickerProps = {
  /**
   * - `name` : nom du chien, lime, police display.
   * - `age` : étoile orange à 24 branches.
   * - `breed` : pilule rose avec patte.
   * - `bubble` : bulle cream manuscrite (jouet préféré, caractère).
   */
  variant: StickerVariant;
  children: string;
  /** Petite ligne au-dessus du texte d'une bulle (« Jouet préféré : »). */
  label?: string;
  /** `md` : carte de match · `sm` : aperçu réduit (fin d'onboarding). */
  size?: StickerSize;
  /** Fond d'une bulle : `cream` (par défaut), `white` ou `pink`. */
  tone?: 'cream' | 'white' | 'pink';
  /** Inclinaison en degrés, entre −6 et +10 (une valeur par défaut par variante). */
  rotate?: number;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_ROTATION: Record<StickerVariant, number> = { name: -4, age: 10, breed: 3, bubble: -6 };

const STAR_SIZES: Record<StickerSize, number> = { sm: 66, md: 74 };

const BUBBLE_TONES = { cream: colors.surface, white: colors.white, pink: colors.pink300 } as const;
const STAR_POINTS =
  '24,2 27.4,10.4 34.5,4.8 33.2,13.8 42.2,12.5 36.6,19.6 45,23 36.6,26.4 42.2,33.5 33.2,32.2 34.5,41.2 27.4,35.6 24,44 20.6,35.6 13.5,41.2 14.8,32.2 5.8,33.5 11.4,26.4 3,23 11.4,19.6 5.8,12.5 14.8,13.8 13.5,4.8 20.6,10.4';

/** Étiquette inclinée posée sur une photo, l'élément signature de PawPote. */
export function Sticker({
  variant,
  children,
  label,
  size = 'md',
  tone = 'cream',
  rotate,
  style,
}: StickerProps) {
  const transform = [{ rotate: `${rotate ?? DEFAULT_ROTATION[variant]}deg` }];
  const s = SIZE_STYLES[size];

  if (variant === 'age') {
    const starSize = STAR_SIZES[size];

    return (
      <View style={[styles.age, { width: starSize, height: starSize, transform }, style]}>
        <Svg width={starSize} height={starSize} viewBox="0 0 48 48" style={StyleSheet.absoluteFill}>
          <Polygon
            points={STAR_POINTS}
            fill={colors.orange500}
            stroke={colors.white}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.ageText, s.ageText]}>{children}</Text>
      </View>
    );
  }

  if (variant === 'bubble') {
    return (
      <View
        style={[styles.base, styles.bubble, { backgroundColor: BUBBLE_TONES[tone], transform }, style]}
      >
        {label && <Text style={[styles.hand, s.bubbleLabel]}>{label}</Text>}
        <Text style={[styles.hand, s.bubbleText]}>{children}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.base, styles.row, styles[variant], s[variant], { transform }, style]}>
      {variant === 'breed' && <Icon name="paw" size={size === 'md' ? 15 : 14} />}
      <Text
        style={variant === 'name' ? [styles.nameText, s.nameText] : [styles.breedText, s.breedText]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderWidth: borderWidth.sticker,
    borderColor: colors.white,
    boxShadow: `0 0 0 2px ${palette.ink}`,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    backgroundColor: colors.lime500,
    boxShadow: `0 0 0 2px ${palette.ink}, 4px 4px 0 2px ${palette.ink}`,
  },
  breed: {
    backgroundColor: colors.pink300,
    borderRadius: radius.pill,
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  nameText: {
    ...typography.titleXl,
    color: colors.text,
  },
  breedText: {
    ...typography.small,
    fontWeight: 800,
    color: colors.text,
  },
  hand: {
    fontFamily: typography.hand.fontFamily,
    color: colors.text,
  },
  age: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    ...typography.titleMd,
    paddingTop: 2,
    color: colors.text,
    textAlign: 'center',
  },
});

/** Dimensions propres à chaque taille. */
const SIZE_STYLES = {
  md: StyleSheet.create({
    name: { paddingTop: 6, paddingBottom: 8, paddingHorizontal: 18, borderRadius: 20 },
    nameText: { fontSize: 36, lineHeight: 38 },
    breed: { gap: 6, paddingVertical: 5, paddingLeft: 9, paddingRight: 12 },
    breedText: { fontSize: 14, lineHeight: 18 },
    ageText: { fontSize: 17, lineHeight: 16 },
    bubbleLabel: { fontSize: 14, lineHeight: 16 },
    bubbleText: { fontSize: 18, lineHeight: 19 },
  }),
  sm: StyleSheet.create({
    name: { paddingTop: 4, paddingBottom: 6, paddingHorizontal: 14, borderRadius: 18 },
    nameText: { fontSize: 32, lineHeight: 34 },
    breed: { gap: 5, paddingVertical: 4, paddingLeft: 8, paddingRight: 12 },
    breedText: { fontSize: 13, lineHeight: 17 },
    ageText: { fontSize: 15, lineHeight: 14 },
    bubbleLabel: { fontSize: 13, lineHeight: 15 },
    bubbleText: { fontSize: 16, lineHeight: 17 },
  }),
};
