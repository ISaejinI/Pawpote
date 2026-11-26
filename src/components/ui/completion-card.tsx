import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, shadows, typography } from '@/theme';

import { Chip } from './chip';
import { ProgressBar } from './progress-bar';

export type CompletionCardProps<T extends string> = {
  /** Part de la fiche remplie, entre 0 et 1. */
  value: number;
  /** Éléments encore vides, affichés en raccourcis. */
  missing: { key: T; label: string }[];
  onPressMissing?: (key: T) => void;
  /** Nom du chien, pour les lecteurs d'écran. */
  dogName: string;
  style?: StyleProp<ViewStyle>;
};

/** Encart lime « Profil complété X % » et raccourcis vers ce qu'il manque. */
export function CompletionCard<T extends string>({
  value,
  missing,
  onPressMissing,
  dogName,
  style,
}: CompletionCardProps<T>) {
  const percent = Math.round(value * 100);

  return (
    <View accessibilityLabel="Complétion du profil" style={[styles.card, style]}>
      <View style={styles.heading}>
        <Text style={styles.title}>Profil complété</Text>
        <Text style={styles.percent}>{percent} %</Text>
      </View>

      <ProgressBar value={value} accessibilityLabel={`Complétion du profil de ${dogName}`} />

      {missing.length > 0 ? (
        <>
          <Text style={styles.label}>Il manque encore :</Text>
          <View style={styles.chips}>
            {missing.map(({ key, label }) => (
              <Chip key={key} label={label} missing onPress={() => onPressMissing?.(key)} />
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.hand}>Sa fiche est complète, bravo !</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: 24,
    ...shadows.md,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  percent: {
    ...typography.titleMd,
    lineHeight: 24,
    color: colors.text,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hand: {
    ...typography.hand,
    color: colors.text,
  },
});
