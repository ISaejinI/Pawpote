import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { borderWidth, colors, palette, radius, typography } from '@/theme';

import { Icon } from './icon';

export type StickerVariant = 'name' | 'age' | 'breed';

export type StickerProps = {
  /**
   * - `name` : nom du chien, lime, police display.
   * - `age` : étoile orange à 24 branches.
   * - `breed` : pilule rose avec patte.
   */
  variant: StickerVariant;
  children: string;
  /** Inclinaison en degrés, entre −6 et +10 (une valeur par défaut par variante). */
  rotate?: number;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_ROTATION: Record<StickerVariant, number> = { name: -4, age: 10, breed: 3 };

const STAR_SIZE = 66;
const STAR_POINTS =
  '24,2 27.4,10.4 34.5,4.8 33.2,13.8 42.2,12.5 36.6,19.6 45,23 36.6,26.4 42.2,33.5 33.2,32.2 34.5,41.2 27.4,35.6 24,44 20.6,35.6 13.5,41.2 14.8,32.2 5.8,33.5 11.4,26.4 3,23 11.4,19.6 5.8,12.5 14.8,13.8 13.5,4.8 20.6,10.4';

/** Étiquette inclinée posée sur une photo, l'élément signature de PawPote. */
export function Sticker({ variant, children, rotate, style }: StickerProps) {
  const transform = [{ rotate: `${rotate ?? DEFAULT_ROTATION[variant]}deg` }];

  if (variant === 'age') {
    return (
      <View style={[styles.age, { transform }, style]}>
        <Svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 48 48" style={StyleSheet.absoluteFill}>
          <Polygon
            points={STAR_POINTS}
            fill={colors.orange500}
            stroke={colors.white}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.ageText}>{children}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.base, styles[variant], { transform }, style]}>
      {variant === 'breed' && <Icon name="paw" size={14} />}
      <Text style={variant === 'name' ? styles.nameText : styles.breedText} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: borderWidth.sticker,
    borderColor: colors.white,
  },
  name: {
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.lime500,
    borderRadius: 18,
    boxShadow: `0 0 0 2px ${palette.ink}, 4px 4px 0 2px ${palette.ink}`,
  },
  breed: {
    gap: 5,
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 12,
    backgroundColor: colors.pink300,
    borderRadius: radius.pill,
    boxShadow: `0 0 0 2px ${palette.ink}`,
  },
  nameText: {
    ...typography.titleXl,
    fontSize: 32,
    lineHeight: 34,
    color: colors.text,
  },
  breedText: {
    ...typography.small,
    fontWeight: 800,
    color: colors.text,
  },
  age: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    ...typography.titleMd,
    fontSize: 15,
    lineHeight: 14,
    paddingTop: 2,
    color: colors.text,
    textAlign: 'center',
  },
});
