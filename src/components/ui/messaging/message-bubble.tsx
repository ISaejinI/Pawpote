import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, shadows, typography } from '@/theme';

import { Icon } from '../base/icon';

export type MessageBubbleProps = {
  /** `me` : bulle lavande à droite, avec ombre · `them` : bulle blanche à gauche. */
  from: 'me' | 'them';
  children: string;
  /** Heure d'envoi (« 10:05 »). */
  time: string;
  /** Message envoyé et lu : double coche violette après l'heure. */
  read?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Bulle d'un message texte, avec son heure en bas à droite. */
export function MessageBubble({ from, children, time, read = false, style }: MessageBubbleProps) {
  const mine = from === 'me';

  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs, style]}>
      <Text style={styles.text}>{children}</Text>
      <View style={styles.meta}>
        <Text style={styles.time}>{time}</Text>
        {mine && read && (
          <Icon name="check-double" size={16} color={colors.link} strokeWidth={2.4} accessibilityLabel="Lu" />
        )}
      </View>
    </View>
  );
}

/** Largeur maximale d'une bulle (px). */
const MAX_WIDTH = 268;
const RADIUS = 18;
/** Coin « queue » de la bulle, côté de l'expéditeur. */
const TAIL_RADIUS = 6;

const styles = StyleSheet.create({
  bubble: {
    maxWidth: MAX_WIDTH,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 12,
    gap: 2,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: RADIUS,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: TAIL_RADIUS,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.lavender200,
    borderBottomRightRadius: TAIL_RADIUS,
    ...shadows.sm,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
  },
  meta: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    ...typography.caption,
    fontWeight: 600,
    color: colors.text,
  },
});
