import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

import { IconButton } from './icon-button';
import { ProgressBar } from './progress-bar';

export type OnboardingStepsProps = {
  /** Étape courante, à partir de 1. */
  step: number;
  total: number;
  /** Nom court de l'étape, en manuscrit (« Ton chien »). */
  label: string;
  /** Sans `onBack`, le bouton retour n'est pas affiché (première étape). */
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** En-tête des étapes d'onboarding : retour, nom de l'étape, « Étape n sur N » et barre de progression. */
export function OnboardingSteps({ step, total, label, onBack, style }: OnboardingStepsProps) {
  return (
    <View style={[styles.row, style]}>
      {onBack && (
        <IconButton icon="back" variant="surface" accessibilityLabel="Retour" onPress={onBack} />
      )}

      <View style={styles.main}>
        <View style={styles.labels}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.count}>
            Étape {step} sur {total}
          </Text>
        </View>

        <ProgressBar
          value={step / total}
          accessibilityLabel={`Étape ${step} sur ${total} : ${label}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    ...typography.handLg,
    fontSize: 19,
    lineHeight: 22,
    flexShrink: 1,
    color: colors.text,
  },
  count: {
    ...typography.small,
    fontWeight: 800,
    color: colors.text,
  },
});
