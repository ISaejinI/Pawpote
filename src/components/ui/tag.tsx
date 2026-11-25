import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';

export type TagColor = 'white' | 'pink' | 'lime';

export type TagProps = {
  children: string;
  /** `white` : info neutre · `pink` : caractère · `lime` : activité. */
  color?: TagColor;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

const BACKGROUNDS: Record<TagColor, string> = {
  white: colors.field,
  pink: colors.pink300,
  lime: colors.lime500,
};

/** Pilule d'information en lecture seule (la version cliquable est `Chip`). */
export function Tag({ children, color = 'white', icon, style }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: BACKGROUNDS[color] }, style]}>
      {icon && <Icon name={icon} size={16} strokeWidth={2.2} />}
      <Text style={styles.text} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  text: {
    ...typography.label,
    color: colors.text,
  },
});
