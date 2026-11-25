import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, typography } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';

export type TextLinkProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  /** `danger` : action destructrice (« Supprimer cette photo »). */
  tone?: 'default' | 'danger';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

/** Action secondaire en texte souligné (« Passer cette étape », « Modifier son profil »). */
export function TextLink({ children, tone = 'default', icon, style, ...rest }: TextLinkProps) {
  const color = tone === 'danger' ? colors.danger : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={10}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} color={color} strokeWidth={2.2} />}
      <Text style={[styles.text, { color }, tone === 'danger' && styles.strong]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    minHeight: 24,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    ...typography.label,
    fontSize: 15,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  strong: {
    fontWeight: 800,
  },
});
