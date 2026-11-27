import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

import { Icon } from '../base/icon';
import type { IconName } from '../base/icons';
import { IconTile, type IconTileColor } from '../base/icon-tile';

export type MenuRowProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: IconName;
  iconColor?: IconTileColor;
  title: string;
  /** Précision sous le titre (« Pour calculer les distances »). */
  subtitle?: string;
  /** Action destructrice (Supprimer mon compte) : titre en `danger`. */
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Ligne d'un menu : tuile d'icône, titre, précision et chevron. Se range dans un `MenuSection`. */
export function MenuRow({ icon, iconColor, title, subtitle, danger = false, style, ...rest }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      {...rest}
    >
      <IconTile icon={icon} color={iconColor} />

      <View style={styles.text}>
        <Text style={[styles.title, danger && styles.danger]}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <Icon name="chevron-right" size={18} strokeWidth={2.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  pressed: {
    backgroundColor: colors.lavender100,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  title: {
    ...typography.body,
    fontWeight: 700,
    color: colors.text,
  },
  danger: {
    color: colors.danger,
  },
  subtitle: {
    ...typography.small,
    fontWeight: 500,
    color: colors.text,
  },
});
