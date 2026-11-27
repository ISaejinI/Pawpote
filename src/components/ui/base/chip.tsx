import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';
import { pressFeedback } from './press-feedback';

export type ChipColor = 'pink' | 'lime';

export type ChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  selected?: boolean;
  /** Fond une fois sélectionnée : `pink` pour le caractère, `lime` pour les activités et les parcs. */
  color?: ChipColor;
  /** Raccourci vers un champ à compléter : pointillés et « + ». */
  missing?: boolean;
  /** Icône affichée tant que la pastille n'est pas sélectionnée (sélectionnée : coche). */
  icon?: IconName;
  /** `sm` : version compacte dans une ligne (bouton Ajouter d'un parc). */
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
};

const SELECTED_COLORS: Record<ChipColor, string> = {
  pink: colors.pink300,
  lime: colors.lime500,
};

/** Choix à bascule en pilule de 40 px (Pastille du design system). */
export function Chip({
  label,
  selected = false,
  color = 'lime',
  missing = false,
  icon,
  size = 'md',
  disabled,
  style,
  accessibilityState,
  ...rest
}: ChipProps) {
  const isDisabled = !!disabled;
  const leadingIcon: IconName | undefined = missing ? 'plus' : selected ? 'check' : icon;

  return (
    <Pressable
      accessibilityRole={missing ? 'button' : 'togglebutton'}
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        ...(!missing && { checked: selected }),
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        selected && { backgroundColor: SELECTED_COLORS[color] },
        missing && styles.missing,
        ...pressFeedback({ shadow: null, pressed, disabled: isDisabled }),
        style,
      ]}
      {...rest}
    >
      {leadingIcon && (
        <Icon
          name={leadingIcon}
          size={14}
          strokeWidth={leadingIcon === 'check' ? 3.4 : 2.8}
        />
      )}
      <Text style={[styles.label, size === 'sm' && styles.labelSm]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.field,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  sm: {
    gap: 4,
    paddingHorizontal: 12,
  },
  missing: {
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  labelSm: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: 800,
  },
});
