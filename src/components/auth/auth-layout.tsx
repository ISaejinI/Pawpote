import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo, SegmentedControl, WaveBackground } from '@/components/ui';
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

  return (
    <View style={styles.root}>
      <WaveBackground />

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
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

          <View style={styles.card}>
            <SegmentedControl
              accessibilityLabel="Connexion ou inscription"
              options={MODES}
              value={mode}
              onChange={(next) => router.replace(next === 'sign-in' ? '/sign-in' : '/sign-up')}
            />
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
