import { useState, type Ref } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { useFormField } from './form-field';

export type TextAreaProps = Omit<TextInputProps, 'style' | 'multiline'> & {
  ref?: Ref<TextInputInstance>;
  /** Erreur de saisie : contour `danger`. */
  invalid?: boolean;
  /** Style du conteneur (ex. `flexGrow: 1` pour occuper la hauteur restante). */
  style?: StyleProp<ViewStyle>;
};

/** Champ de texte sur plusieurs lignes, avec compteur quand `maxLength` est fourni. */
export function TextArea({
  ref,
  invalid,
  style,
  value,
  maxLength,
  onFocus,
  onBlur,
  placeholderTextColor = colors.placeholder,
  accessibilityLabel,
  ...rest
}: TextAreaProps) {
  const field = useFormField();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.root, style]}>
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        value={value}
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel ?? field?.label}
        placeholderTextColor={placeholderTextColor}
        cursorColor={colors.text}
        selectionColor={colors.active}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, isInvalid && styles.invalid, focused && shadows.sm]}
        {...rest}
      />

      {maxLength !== undefined && (
        <Text style={styles.counter} accessibilityLiveRegion="polite">
          {value?.length ?? 0}/{maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  input: {
    flexGrow: 1,
    minHeight: 140,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.md,
    ...typography.body,
    color: colors.text,
    includeFontPadding: false,
  },
  invalid: {
    borderColor: colors.danger,
  },
  counter: {
    ...typography.small,
    alignSelf: 'flex-end',
    color: colors.text,
  },
});
