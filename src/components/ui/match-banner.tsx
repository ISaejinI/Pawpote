import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, palette, typography } from '@/theme';

import { Icon } from './icon';

export type MatchBannerProps = {
  /** Mon chien. */
  ownDog: string;
  /** Le chien de l'autre maître. */
  otherDog: string;
  style?: StyleProp<ViewStyle>;
};

/** Sticker incliné en tête de conversation : « C'est un match ! Biscotte ♥ Pistou ». */
export function MatchBanner({ ownDog, otherDog, style }: MatchBannerProps) {
  return (
    <View
      accessible
      accessibilityLabel={`C’est un match entre ${ownDog} et ${otherDog} !`}
      style={[styles.sticker, style]}
    >
      <Text style={styles.title}>C’est un match !</Text>
      <View style={styles.dogs}>
        <Text style={styles.hand}>{ownDog}</Text>
        <Icon name="heart" size={18} color={colors.mandarin600} strokeWidth={1.8} outlineColor={colors.text} />
        <Text style={styles.hand}>{otherDog}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.pink300,
    borderWidth: borderWidth.sticker,
    borderColor: colors.white,
    borderRadius: 18,
    boxShadow: `0 0 0 2px ${palette.ink}, 4px 4px 0 2px ${palette.ink}`,
    transform: [{ rotate: '-3deg' }],
  },
  title: {
    ...typography.titleMd,
    fontSize: 18,
    lineHeight: 20,
    color: colors.text,
  },
  dogs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hand: {
    ...typography.hand,
    color: colors.text,
  },
});
