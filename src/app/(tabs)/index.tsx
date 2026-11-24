
import * as Device from 'expo-device';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }

  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }

  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';

  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />

          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={
              <ThemedText type="code">
                src/app/(tabs)/index.tsx
              </ThemedText>
            }
          />

          <HintRow title="Dev tools" hint={getDevMenuHint()} />

          <HintRow
            title="Fresh start"
            hint={
              <ThemedText type="code">
                npm run reset-project
              </ThemedText>
            }
          />
        </ThemedView>

        <ThemedView style={styles.authSection}>
          <ThemedText type="small">
            Connecté en tant que :
          </ThemedText>

          <ThemedText type="smallBold">
            {session?.user.email ?? 'Utilisateur'}
          </ThemedText>

          <Pressable
            style={[
              styles.signOutButton,
              loading && styles.signOutButtonDisabled,
            ]}
            onPress={handleSignOut}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.signOutButtonText}>
                Se déconnecter
              </ThemedText>
            )}
          </Pressable>

          {signOutError ? (
            <ThemedText style={styles.errorText}>
              {signOutError}
            </ThemedText>
          ) : null}
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  authSection: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  signOutButton: {
    backgroundColor: '#208AEF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
});
