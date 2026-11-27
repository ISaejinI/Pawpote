import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { Icon } from '../base/icon';

export type SearchFieldProps = Omit<TextInputProps, 'style'> & {
  /** Obligatoire : le champ n'a pas de libellé visible. */
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/** Champ de recherche en pilule, loupe à gauche, posé sur le fond de l'écran. */
export function SearchField({
  style,
  onFocus,
  onBlur,
  placeholderTextColor = colors.placeholder,
  ...rest
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.box, focused && styles.focused, style]}>
      <Icon name="search" size={18} strokeWidth={2.4} />
      <TextInput
        placeholderTextColor={placeholderTextColor}
        cursorColor={colors.text}
        selectionColor={colors.active}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 14,
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
    ...shadows.sm,
  },
  focused: {
    borderColor: colors.active,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingRight: 14,
    paddingVertical: 0,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.text,
    includeFontPadding: false,
  },
});
