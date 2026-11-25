import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, useTapbarInset } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import {
  borderWidth,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/theme';

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const tapbarInset = useTapbarInset();

  const [loading, setLoading] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function handleSignOut() {
    if (loading) return;

    setLoading(true);
    setSignOutError('');

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setSignOutError(
          result.error.message ?? 'Impossible de se déconnecter.',
        );
      }
    } catch (error) {
      console.error('Better Auth sign-out error:', error);
      setSignOutError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { paddingBottom: tapbarInset }]}
    >
      <Text style={styles.title}>Mon profil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Connecté en tant que :</Text>
        <Text style={styles.email}>
          {session?.user.email ?? 'Utilisateur'}
        </Text>

        <Button
          variant="secondary"
          icon="log-out"
          onPress={handleSignOut}
          loading={loading}
          style={styles.button}
        >
          Se déconnecter
        </Button>

        {signOutError ? (
          <Text style={styles.errorText}>{signOutError}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing[4],
    gap: spacing[6],
  },
  title: {
    ...typography.titleXl,
    color: colors.text,
    paddingTop: spacing[5],
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing[4],
    gap: spacing[2],
    ...shadows.lg,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
  },
  email: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  button: {
    marginTop: spacing[2],
  },
  errorText: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
});
