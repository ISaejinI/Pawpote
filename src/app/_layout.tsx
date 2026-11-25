import { useFonts } from 'expo-font'
import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { authClient } from '@/lib/auth-client'
import { OnboardingStatusProvider, useOnboardingStatus } from '@/lib/onboarding-status'
import { colors, fontDefinitions } from '@/theme'

void SplashScreen.preventAutoHideAsync()

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.active,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.mandarin600,
  },
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontDefinitions)
  const { data: session, isPending } = authClient.useSession()

  // L'écran de démarrage reste affiché tant que les polices et la session ne sont pas prêtes
  const ready = (fontsLoaded || !!fontError) && !isPending

  useEffect(() => {
    if (fontError) console.error('Font loading error:', fontError)
  }, [fontError])

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  if (!ready) return null

  return (
    <ThemeProvider value={navigationTheme}>
      {/* Suit le clavier pour que les formulaires gardent le champ actif visible */}
      <KeyboardProvider>
        <OnboardingStatusProvider userId={session?.user.id}>
          <RootStack signedIn={!!session} />
        </OnboardingStatusProvider>
      </KeyboardProvider>
    </ThemeProvider>
  )
}

function RootStack({ signedIn }: { signedIn: boolean }) {
  const { needsOnboarding } = useOnboardingStatus()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Compte tout juste créé, ou sans profil ni chien : onboarding d'abord */}
      <Stack.Protected guard={signedIn && needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && !needsOnboarding}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack.Protected>

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" options={{ animation: 'fade' }} />
        <Stack.Screen name="sign-up" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  )
}
