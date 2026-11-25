import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme';

import { icons, type IconName } from './icons';

export type IconProps = {
  name: IconName;
  /** Taille en px (18–22 dans l'interface, 40 pour la tapbar). */
  size?: number;
  /** Couleur des icônes d'interface. Sans effet sur les illustrations multicolores. */
  color?: string;
  /** Épaisseur du trait des icônes d'interface (2 par défaut). */
  strokeWidth?: number;
  /** Ajoute un contour de cette couleur à une icône pleine (ex. le cœur crème cerclé d'ink). */
  outlineColor?: string;
  /** À renseigner si l'icône porte du sens seule ; sinon elle est décorative. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({
  name,
  size = 22,
  color = colors.text,
  strokeWidth,
  outlineColor,
  accessibilityLabel,
  style,
}: IconProps) {
  const Svg = icons[name];

  return (
    <Svg
      width={size}
      height={size}
      color={color}
      strokeWidth={strokeWidth}
      {...(outlineColor && { stroke: outlineColor, strokeLinejoin: 'round' as const })}
      style={style}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    />
  );
}
