import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, TabPage } from '@/components/ui';
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
    <TabPage title="Mon profil">
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
    </TabPage>
  );
}

const styles = StyleSheet.create({
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
