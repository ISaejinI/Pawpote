import { useState, type ReactNode, type Ref } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import {
  borderWidth,
  colors,
  radius,
  shadows,
  typography,
} from '@/theme';

import { useFormField } from './form-field';
import { Icon } from './icon';
import type { IconName } from './icons';

export type InputProps = Omit<TextInputProps, 'style'> & {
  ref?: Ref<TextInputInstance>;
  /**
   * Champ facultatif encore vide sur une fiche existante (« À compléter ») :
   * contour pointillé mandarin et fond rosé tant qu'il est vide.
   */
  missing?: boolean;
  /** Erreur de saisie : contour `danger`. */
  invalid?: boolean;
  /** Icône décorative à droite (ex. calendrier). */
  icon?: IconName;
  /** Élément interactif à droite (ex. bouton œil du mot de passe), 44 px max. */
  trailing?: ReactNode;
  /** Style du conteneur (marges, largeur). */
  style?: StyleProp<ViewStyle>;
};

const HEIGHT = 50;
const PADDING_X = 14;
/** Espace réservé à droite quand une icône ou un élément est présent. */
const TRAILING_SPACE = 48;

export function Input({
  ref,
  missing,
  invalid,
  icon,
  trailing,
  style,
  value,
  defaultValue,
  editable = true,
  onChangeText,
  onFocus,
  onBlur,
  placeholderTextColor = colors.placeholder,
  accessibilityLabel,
  ...rest
}: InputProps) {
  // Dans un FormField, le champ reprend son libellé, son erreur et son état « À compléter »
  const field = useFormField();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const isMissing = missing ?? field?.missing ?? false;

  const [focused, setFocused] = useState(false);
  // Suit le texte saisi pour savoir si le champ est vide, même en mode non contrôlé
  const [uncontrolledText, setUncontrolledText] = useState(defaultValue ?? '');
  const text = value ?? uncontrolledText;

  const showMissing = isMissing && text.length === 0 && !focused;
  const hasTrailing = !!icon || !!trailing;

  return (
    <View
      style={[
        styles.box,
        showMissing && styles.missing,
        isInvalid && styles.invalid,
        focused && shadows.sm,
        !editable && styles.disabled,
        style,
      ]}
    >
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? field?.label}
        value={value}
        defaultValue={defaultValue}
        editable={editable}
        placeholderTextColor={placeholderTextColor}
        cursorColor={colors.text}
        selectionColor={colors.active}
        onChangeText={(next) => {
          if (value === undefined) setUncontrolledText(next);
          onChangeText?.(next);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, hasTrailing && styles.inputWithTrailing]}
        {...rest}
      />

      {hasTrailing && (
        <View style={styles.trailing} pointerEvents={trailing ? 'box-none' : 'none'}>
          {trailing ?? (icon && <Icon name={icon} size={20} />)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  missing: {
    backgroundColor: colors.missing50,
    borderColor: colors.mandarin600,
    borderStyle: 'dashed',
  },
  invalid: {
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: PADDING_X,
    paddingVertical: 0,
    // Pas de lineHeight : sur iOS il décale le texte d'un champ sur une ligne
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.text,
    // Retire la marge interne ajoutée par Android autour de la police
    includeFontPadding: false,
  },
  inputWithTrailing: {
    paddingRight: TRAILING_SPACE,
  },
  trailing: {
    position: 'absolute',
    right: 3,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
