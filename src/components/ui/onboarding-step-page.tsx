import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderWidth, colors, radius, shadows, spacing, typography } from '@/theme';

import { Button } from './button';
import { OnboardingSteps } from './onboarding-steps';
import { TextLink } from './text-link';
import { WaveBackground } from './wave-background';

export type OnboardingStepPageProps = {
  step: number;
  total: number;
  /** Nom court de l'étape, dans l'en-tête (« Ton chien »). */
  stepLabel: string;
  /** Titre de l'écran (« Présente-nous ton chien »). */
  title: string;
  /** Sous-titre manuscrit. */
  subtitle: string;
  /** Contenu de la carte cream (le formulaire). */
  children: ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  /** Enregistrement en cours : bouton Continuer en chargement. */
  continueLoading?: boolean;
  /** Sans `onBack`, pas de bouton retour (première étape). */
  onBack?: () => void;
  /** Lien « Passer cette étape », seulement si toute l'étape est facultative. */
  onSkip?: () => void;
};

/** Espace gardé entre le champ actif et le haut du clavier. */
const KEYBOARD_OFFSET = spacing[6];

/** Gabarit des étapes d'onboarding (TemplateEtape du design system). Pas de Tapbar. */
export function OnboardingStepPage({
  step,
  total,
  stepLabel,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = 'Continuer',
  continueLoading = false,
  onBack,
  onSkip,
}: OnboardingStepPageProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <WaveBackground />

      {/* Fait défiler la page pour garder le champ actif au-dessus du clavier */}
      <KeyboardAwareScrollView
        style={styles.root}
        bottomOffset={KEYBOARD_OFFSET}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing[2],
            paddingBottom: insets.bottom + spacing[5],
          },
        ]}
      >
        <OnboardingSteps step={step} total={total} label={stepLabel} onBack={onBack} />

        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>{children}</View>

        <Button icon="arrow-right" iconPosition="end" onPress={onContinue} loading={continueLoading}>
          {continueLabel}
        </Button>

        {onSkip && <TextLink onPress={onSkip}>Passer cette étape</TextLink>}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    gap: 14,
  },
  heading: {
    gap: 2,
  },
  title: {
    ...typography.titleLg,
    color: colors.text,
  },
  subtitle: {
    ...typography.handLg,
    fontSize: 19,
    lineHeight: 22,
    color: colors.text,
  },
  card: {
    flexGrow: 1,
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.xl,
    ...shadows.lg,
  },
});
