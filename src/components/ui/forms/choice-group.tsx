import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { useFormField } from './form-field';
import { pressFeedback } from '../base/press-feedback';

export type ChoiceOption<T extends string> = { value: T; label: string };

export type ChoiceGroupProps<T extends string> = {
  options: readonly ChoiceOption<T>[];
  /** Choix courant ; `null` tant que rien n'est choisi. */
  value: T | null;
  onChange: (value: T) => void;
  /** Par défaut, le libellé du FormField parent. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Choix unique parmi quelques boutons côte à côte (ex. Femelle / Mâle). */
export function ChoiceGroup<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: ChoiceGroupProps<T>) {
  const field = useFormField();
  const invalid = field?.invalid ?? false;

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel ?? field?.label}
      style={[styles.row, style]}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              invalid && styles.invalid,
              ...pressFeedback({ shadow: null, pressed, disabled: false }),
            ]}
          >
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  selected: {
    backgroundColor: colors.active,
  },
  invalid: {
    borderColor: colors.danger,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.text,
  },
});
