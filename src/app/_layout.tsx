import { useFonts } from 'expo-font'
import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { MatchCelebrationProvider } from '@/features/discovery/components/match-celebration'
import { LoadingPage } from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { OnboardingStatusProvider, useOnboardingStatus } from '@/features/onboarding/onboarding-status'
import { colors, fontDefinitions } from '@/theme'

void SplashScreen.preventAutoHideAsync()

/** Durée minimale de l'écran de chargement au lancement, pour qu'on ait le temps de le voir. */
const MIN_LOADING_MS = 3000

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

  // L'écran de démarrage natif reste affiché le temps de charger les polices ; l'écran de
  // chargement prend ensuite le relais jusqu'à connaître la session et l'onboarding (voir RootStack)
  const fontsReady = fontsLoaded || !!fontError

  useEffect(() => {
    if (fontError) console.error('Font loading error:', fontError)
  }, [fontError])

  useEffect(() => {
    // Même fond lavande des deux côtés : le passage à l'écran de chargement ne se voit pas
    if (fontsReady) void SplashScreen.hideAsync()
  }, [fontsReady])

  // Le chargement continue pendant ce délai : l'app s'ouvre dès qu'il est écoulé et tout est prêt
  const [minDelayDone, setMinDelayDone] = useState(false)
  useEffect(() => {
    if (!fontsReady) return
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADING_MS)
    return () => clearTimeout(timer)
  }, [fontsReady])

  if (!fontsReady) return null

  return (
    <ThemeProvider value={navigationTheme}>
      {/* Suit le clavier pour que les formulaires gardent le champ actif visible */}
      <KeyboardProvider>
        <OnboardingStatusProvider userId={session?.user.id}>
          <MatchCelebrationProvider>
            <RootStack signedIn={!!session} loading={isPending || !minDelayDone} />
          </MatchCelebrationProvider>
        </OnboardingStatusProvider>
      </KeyboardProvider>
    </ThemeProvider>
  )
}

function RootStack({ signedIn, loading }: { signedIn: boolean; loading: boolean }) {
  const { isLoading, needsOnboarding } = useOnboardingStatus()

  // Un seul écran de chargement pour toute l'attente : les pattes ne repartent pas de zéro
  if (loading || isLoading) return <LoadingPage />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Compte tout juste créé, ou sans profil ni chien : onboarding d'abord */}
      <Stack.Protected guard={signedIn && needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && !needsOnboarding}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="conversation/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="my-dog/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="add-dog" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="account/identity" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="account/address" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="account/email" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="account/password" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="account/delete" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="dog/[id]"
          // Transparente : la carte reste visible derrière quand on tire le profil vers le bas
          options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" options={{ animation: 'fade' }} />
        <Stack.Screen name="sign-up" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  )
}
