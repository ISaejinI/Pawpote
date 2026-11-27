import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { borderWidth, colors, palette, radius, typography } from '@/theme';

import { Icon } from './icon';

export type StickerVariant = 'name' | 'age' | 'breed' | 'bubble';
export type StickerSize = 'sm' | 'md';

export type StickerProps = {
  /**
   * - `name` : nom du chien, lime, police display.
   * - `age` : macaron orange festonné, chiffre en display et unité manuscrite (`label`).
   * - `breed` : pilule rose avec patte.
   * - `bubble` : bulle cream manuscrite (jouet préféré, caractère).
   */
  variant: StickerVariant;
  children: string;
  /**
   * Bulle : petite ligne au-dessus du texte (« Jouet préféré : »).
   * Âge : unité manuscrite sous le chiffre (« ans »).
   */
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

const BUBBLE_TONES = { cream: colors.surface, white: colors.white, pink: colors.pink300 } as const;

// ---- Macaron de l'âge -------------------------------------------------------

const ROSETTE_SIZES: Record<StickerSize, number> = { sm: 70, md: 80 };

/** Le macaron est dessiné dans un carré de 100 unités, centré en 47 pour laisser la place à l'ombre. */
const ROSETTE_CENTER = 47;
/** Ombre décalée vers le bas à droite, comme le sticker du nom. */
const ROSETTE_SHADOW = 5;

/**
 * Contour festonné : `count` arrondis entre un rayon creux et un rayon de crête.
 * Chaque feston est une courbe dont le sommet atteint exactement `peak`.
 */
function rosettePath(count: number, valley: number, peak: number) {
  const step = (2 * Math.PI) / count;
  const control = 2 * peak - valley * Math.cos(step / 2);
  const point = (r: number, angle: number) =>
    `${(ROSETTE_CENTER + r * Math.cos(angle)).toFixed(2)} ${(ROSETTE_CENTER + r * Math.sin(angle)).toFixed(2)}`;

  let d = `M ${point(valley, 0)}`;
  for (let i = 0; i < count; i++) {
    const start = i * step;
    d += ` Q ${point(control, start + step / 2)} ${point(valley, start + step)}`;
  }
  return `${d} Z`;
}

const ROSETTE_PATH = rosettePath(12, 35, 40);
/** Contour blanc (≈ 3 px) puis ink (≈ 2 px), comme les autres stickers. */
const ROSETTE_WHITE_STROKE = 7.5;
const ROSETTE_INK_STROKE = 12.5;

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
    const box = ROSETTE_SIZES[size];
    // Le texte est centré sur le macaron, pas sur le carré (qui inclut l'ombre)
    const inner = (box * ROSETTE_CENTER * 2) / 100;
    const isNumber = /^\d+$/.test(children);

    return (
      <View style={[{ width: box, height: box, transform }, style]}>
        <Svg width={box} height={box} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          <Path
            d={ROSETTE_PATH}
            transform={`translate(${ROSETTE_SHADOW} ${ROSETTE_SHADOW})`}
            fill={palette.ink}
            stroke={palette.ink}
            strokeWidth={ROSETTE_INK_STROKE}
            strokeLinejoin="round"
          />
          <Path
            d={ROSETTE_PATH}
            fill={palette.ink}
            stroke={palette.ink}
            strokeWidth={ROSETTE_INK_STROKE}
            strokeLinejoin="round"
          />
          <Path
            d={ROSETTE_PATH}
            fill={colors.white}
            stroke={colors.white}
            strokeWidth={ROSETTE_WHITE_STROKE}
            strokeLinejoin="round"
          />
          <Path d={ROSETTE_PATH} fill={colors.orange500} />
        </Svg>

        <View style={[styles.ageContent, { width: inner, height: inner }]}>
          <Text style={[styles.ageValue, isNumber ? s.ageNumber : s.ageWord]}>{children}</Text>
          {label && <Text style={[styles.hand, s.ageUnit]}>{label}</Text>}
        </View>
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
  ageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageValue: {
    fontFamily: typography.titleXl.fontFamily,
    color: colors.text,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

/** Dimensions propres à chaque taille. */
const SIZE_STYLES = {
  md: StyleSheet.create({
    name: { paddingTop: 6, paddingBottom: 8, paddingHorizontal: 18, borderRadius: 20 },
    nameText: { fontSize: 36, lineHeight: 38 },
    breed: { gap: 6, paddingVertical: 5, paddingLeft: 9, paddingRight: 12 },
    breedText: { fontSize: 14, lineHeight: 18 },
    ageNumber: { fontSize: 30, lineHeight: 30 },
    ageWord: { fontSize: 16, lineHeight: 18 },
    ageUnit: { fontSize: 17, lineHeight: 15, marginTop: -2 },
    bubbleLabel: { fontSize: 14, lineHeight: 16 },
    bubbleText: { fontSize: 18, lineHeight: 19 },
  }),
  sm: StyleSheet.create({
    name: { paddingTop: 4, paddingBottom: 6, paddingHorizontal: 14, borderRadius: 18 },
    nameText: { fontSize: 32, lineHeight: 34 },
    breed: { gap: 5, paddingVertical: 4, paddingLeft: 8, paddingRight: 12 },
    breedText: { fontSize: 13, lineHeight: 17 },
    ageNumber: { fontSize: 26, lineHeight: 26 },
    ageWord: { fontSize: 14, lineHeight: 16 },
    ageUnit: { fontSize: 15, lineHeight: 13, marginTop: -2 },
    bubbleLabel: { fontSize: 13, lineHeight: 15 },
    bubbleText: { fontSize: 16, lineHeight: 17 },
  }),
};
