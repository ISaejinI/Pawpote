import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo, SegmentedControl, TextLink, WaveBackground } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import { borderWidth, colors, radius, shadows, spacing, typography } from '@/theme';

type AuthMode = 'sign-in' | 'sign-up';

type AuthLayoutProps = {
  mode: AuthMode;
  /** Accroche manuscrite sous le logo. */
  tagline: string;
  children: ReactNode;
};

const MODES = [
  { value: 'sign-in', label: 'Connexion' },
  { value: 'sign-up', label: 'Créer un compte' },
] as const satisfies { value: AuthMode; label: string }[];

/** Gabarit commun à la connexion et à l'inscription : logo, accroche, carte avec le choix du mode. */
export function AuthLayout({ mode, tagline, children }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();
  // La vérification de la session au démarrage a échoué (API injoignable ou trop lente)
  const { error: sessionError, isRefetching, refetch } = authClient.useSession();

  return (
    <View style={styles.root}>
      <WaveBackground />

      {/* Fait défiler la page pour garder le champ actif au-dessus du clavier */}
      <KeyboardAwareScrollView
        style={styles.root}
        bottomOffset={spacing[6]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing[6],
            paddingBottom: insets.bottom + spacing[6],
          },
        ]}
      >
        <Logo />
        <Text style={styles.tagline}>{tagline}</Text>

        {sessionError && !isRefetching ? (
          <View style={styles.offline} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={styles.offlineText}>
              Le serveur ne répond pas. Vérifie ta connexion, puis réessaie.
            </Text>
            <TextLink onPress={() => void refetch()}>Réessayer</TextLink>
          </View>
        ) : null}

        <View style={styles.card}>
          <SegmentedControl
            accessibilityLabel="Connexion ou inscription"
            options={MODES}
            value={mode}
            onChange={(next) => router.replace(next === 'sign-in' ? '/sign-in' : '/sign-up')}
          />
          {children}
        </View>
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
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    gap: 18,
  },
  tagline: {
    ...typography.handLg,
    color: colors.text,
    textAlign: 'center',
  },
  // Encadré cream : le message reste lisible sur le fond à vagues
  offline: {
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.danger,
    borderRadius: radius.md,
  },
  offlineText: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingVertical: 18,
    paddingHorizontal: spacing[4],
    gap: 14,
    ...shadows.lg,
  },
});
