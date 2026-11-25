import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Décrit le groupe pour les lecteurs d'écran (ex. « Connexion ou inscription »). */
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/** Choix exclusif en pilule : l'option active est pleine `lavender-500`. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, style]}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (!selected) onChange(option.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && !selected && styles.optionPressed,
            ]}
          >
            <Text style={styles.label} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 50,
    flexDirection: 'row',
    padding: 3,
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  optionSelected: {
    backgroundColor: colors.active,
  },
  optionPressed: {
    backgroundColor: colors.lavender200,
  },
  label: {
    ...typography.button,
    fontSize: 15,
    lineHeight: 18,
    color: colors.text,
  },
});
