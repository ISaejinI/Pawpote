import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, shadows, typography } from '@/theme';

export type FormSectionProps = {
  /** Titre de la section (« Identité », « Son caractère »). */
  title: string;
  /** Champs (`FormField`) de la section. */
  children: ReactNode;
  /** Position de la section, pour y faire défiler la page. */
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
};

/** Section d'un formulaire long : titre, puis ses champs dans une carte cream. */
export function FormSection({ title, children, onLayout, style }: FormSectionProps) {
  return (
    <View style={[styles.section, style]} onLayout={onLayout}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  title: {
    ...typography.titleMd,
    color: colors.text,
  },
  card: {
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: 24,
    ...shadows.md,
  },
});
