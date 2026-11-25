import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authClient } from '@/lib/auth-client';
import {
  borderWidth,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/theme';

export default function HomeScreen() {
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>PawPote</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Connecté en tant que :</Text>
        <Text style={styles.email}>
          {session?.user.email ?? 'Utilisateur'}
        </Text>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Se déconnecter</Text>
          )}
        </Pressable>

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
    backgroundColor: colors.primary,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
    minHeight: 52,
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
  errorText: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
});
