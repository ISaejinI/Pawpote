import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { useFormField } from './form-field';
import { Icon } from './icon';
import { Input } from './input';

export type SelectProps = {
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Affiché quand la recherche ne donne rien. */
  emptyMessage?: string;
  /** Par défaut, le libellé du FormField parent. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const PAGE_SIZE = 40;

function normalizeSearch(value: string) {
  return value.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[-'’]/g, ' ');
}

/**
 * Liste déroulante avec recherche (ex. la race).
 * La liste s'ouvre sous le champ et pousse le contenu, pour rester lisible dans une page qui défile.
 */
export function Select({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Choisis une option',
  searchPlaceholder = 'Rechercher…',
  emptyMessage = 'Aucun résultat.',
  accessibilityLabel,
  style,
}: SelectProps) {
  const field = useFormField();
  const invalid = field?.invalid ?? false;
  const label = accessibilityLabel ?? field?.label;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const words = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const filtered = words.length ? options.filter((option) => {
    const name = normalizeSearch(option);
    return words.every((word) => name.includes(word));
  }) : options;

  function pick(option: string) {
    onChange(option);
    setOpen(false);
    setQuery('');
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <View style={[styles.root, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `${label} : ${value ?? placeholder}` : undefined}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen((current) => !current)}
        style={[styles.trigger, invalid && styles.invalid]}
      >
        <Text
          style={[styles.triggerText, !value && styles.placeholder]}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Text>
        <Icon
          name="chevron-down"
          size={20}
          strokeWidth={2.6}
          style={open && styles.chevronOpen}
        />
      </Pressable>

      {open && (
        <View style={styles.panel}>
          <Input
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder={searchPlaceholder}
            accessibilityLabel={searchPlaceholder}
            icon="search"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.search}
          />

          <ScrollView
            style={styles.list}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            accessibilityLabel={label}
          >
            {filtered.slice(0, visibleCount).map((option) => {
              const selected = option === value;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => pick(option)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && !selected && styles.optionPressed,
                  ]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })}

            {filtered.length === 0 && <Text style={styles.empty}>{emptyMessage}</Text>}
            {filtered.length > visibleCount && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
                style={styles.option}
              >
                <Text style={styles.optionText}>Afficher plus de résultats</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  trigger: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  invalid: {
    borderColor: colors.danger,
  },
  triggerText: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  placeholder: {
    color: colors.placeholder,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  panel: {
    gap: 6,
    padding: 8,
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: 18,
    ...shadows.md,
  },
  search: {
    height: 44,
    borderWidth: borderWidth.thin,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  list: {
    maxHeight: 176,
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionPressed: {
    backgroundColor: colors.surface,
  },
  optionText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
  },
  empty: {
    ...typography.label,
    fontWeight: 500,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.text,
  },
});
