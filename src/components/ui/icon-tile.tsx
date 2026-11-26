import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';

export type IconTileColor = 'lavender' | 'pink' | 'lime' | 'peach';

export type IconTileProps = {
  icon: IconName;
  color?: IconTileColor;
  style?: StyleProp<ViewStyle>;
};

const BACKGROUNDS: Record<IconTileColor, string> = {
  lavender: colors.lavender200,
  pink: colors.pink300,
  lime: colors.lime500,
  peach: colors.peach300,
};

/** Carré arrondi coloré qui porte l'icône d'une ligne de menu. Décoratif. */
export function IconTile({ icon, color = 'lavender', style }: IconTileProps) {
  return (
    <View style={[styles.tile, { backgroundColor: BACKGROUNDS[color] }, style]}>
      <Icon name={icon} size={22} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
});
