import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { Icon } from './icon';

export type BadgeVariant = 'unread' | 'todo' | 'distance' | 'date';

export type BadgeProps = {
  /**
   * - `unread` : nombre de non-lus, mandarin, chiffre blanc.
   * - `todo` : « À compléter », rose, à côté d'un libellé.
   * - `distance` : lime façon sticker, sur une photo.
   * - `date` : cream, au centre d'une conversation.
   */
  variant: BadgeVariant;
  children: string | number;
  style?: StyleProp<ViewStyle>;
};

/** Petite étiquette d'information, non cliquable. */
export function Badge({ variant, children, style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {variant === 'distance' && <Icon name="pin-filled" size={14} />}
      <Text style={[styles.text, textStyles[variant]]} numberOfLines={1}>
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
    borderRadius: radius.pill,
    borderColor: colors.border,
  },
  unread: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    justifyContent: 'center',
    backgroundColor: colors.mandarin600,
    borderWidth: borderWidth.thin,
  },
  todo: {
    height: 22,
    paddingHorizontal: 8,
    backgroundColor: colors.pink300,
    borderWidth: 1.5,
  },
  distance: {
    gap: 5,
    paddingVertical: 5,
    paddingLeft: 9,
    paddingRight: 12,
    backgroundColor: colors.lime500,
    borderWidth: borderWidth.sticker,
    borderColor: colors.white,
    ...shadows.sticker,
  },
  date: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
  },
  text: {
    ...typography.caption,
    color: colors.text,
  },
});

const textStyles = StyleSheet.create({
  // Blanc sur mandarin : réservé au chiffre en 12 px gras (3,9:1)
  unread: { fontSize: 12, lineHeight: 14, fontWeight: 800, color: colors.white },
  todo: { fontWeight: 800 },
  distance: { ...typography.small, fontWeight: 700 },
  date: { fontSize: 12, lineHeight: 15, fontWeight: 800 },
});
