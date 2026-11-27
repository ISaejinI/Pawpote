import { createContext, use, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { Badge } from '../base/badge';

type FormFieldContextValue = {
  label: string;
  invalid: boolean;
  missing: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** Lu par `Input` pour reprendre le libellé (accessibilité), l'erreur et l'état « À compléter ». */
export function useFormField() {
  return use(FormFieldContext);
}

export type FormFieldProps = {
  label: string;
  /** Ajoute « (facultatif) » au libellé. Rien n'est ajouté aux champs obligatoires. */
  optional?: boolean;
  /**
   * Facultatif encore vide sur une fiche existante : badge « À compléter »
   * et champ en pointillés. À passer quand la valeur est vide (`missing={!value}`).
   */
  missing?: boolean;
  /** Message d'erreur sous le champ ; passe aussi le champ en erreur. */
  error?: string;
  /** Un `Input` ou un `PasswordInput`. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Libellé + champ, empilés avec 6 px d'écart, et un éventuel message d'erreur. */
export function FormField({
  label,
  optional = false,
  missing = false,
  error,
  children,
  style,
}: FormFieldProps) {
  return (
    <FormFieldContext value={{ label, invalid: !!error, missing }}>
      <View style={[styles.field, style]}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {optional && <Text style={styles.optional}> (facultatif)</Text>}
          </Text>
          {missing && <Badge variant="todo">À compléter</Badge>}
        </View>

        {children}

        {error ? (
          <Text
            style={styles.error}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        ) : null}
      </View>
    </FormFieldContext>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...typography.label,
    color: colors.text,
    flexShrink: 1,
  },
  optional: {
    fontWeight: 500,
    color: colors.textMuted,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    paddingHorizontal: spacing[1],
  },
});
