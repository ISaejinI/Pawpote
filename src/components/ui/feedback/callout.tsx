import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { Icon } from '../base/icon';
import type { IconName } from '../base/icons';

export type CalloutProps = {
  /**
   * - `info` : encart lime encadré (ex. confidentialité de l'adresse).
   * - `tip` : astuce manuscrite, sans cadre, étincelle mandarin.
   */
  variant: 'info' | 'tip';
  /** Icône de l'encart `info` (`lock` par défaut). */
  icon?: IconName;
  children: string;
  style?: StyleProp<ViewStyle>;
};

/** Petit texte d'aide placé dans une carte. */
export function Callout({ variant, icon = 'lock', children, style }: CalloutProps) {
  const isTip = variant === 'tip';

  return (
    <View style={[styles.base, !isTip && styles.info, style]}>
      {isTip ? (
        <Icon name="sparkle" size={22} color={colors.mandarin600} strokeWidth={2.6} />
      ) : (
        <Icon name={icon} size={20} strokeWidth={2.2} />
      )}
      <Text style={[styles.text, isTip ? styles.tipText : styles.infoText]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  info: {
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  text: {
    flex: 1,
    color: colors.text,
  },
  tipText: {
    ...typography.hand,
  },
  infoText: {
    ...typography.small,
  },
});
