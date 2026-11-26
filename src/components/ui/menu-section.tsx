import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

export type MenuSectionProps = {
  /** Titre de la section (« Mes chiens », « Paramètres »). */
  title: string;
  /** Lignes du groupe (`MenuRow`, `DogRow`), séparées par un trait fin. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Section d'une page de réglages : titre, puis ses lignes regroupées dans une carte cream. */
export function MenuSection({ title, children, style }: MenuSectionProps) {
  const rows = Children.toArray(children);

  return (
    <View style={[styles.section, style]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>

      <View style={styles.card}>
        {/* Coins rognés dans une vue intérieure : sur la carte, ils couperaient l'ombre */}
        <View style={styles.clip}>
          {rows.map((row, index) => (
            <Fragment key={index}>
              {index > 0 && <View style={styles.divider} />}
              {row}
            </Fragment>
          ))}
        </View>
      </View>
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
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  clip: {
    borderRadius: radius.lg - borderWidth.regular,
    overflow: 'hidden',
  },
  divider: {
    height: borderWidth.thin,
    backgroundColor: 'rgba(30, 18, 64, 0.14)',
  },
});
