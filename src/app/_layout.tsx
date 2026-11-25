import { useFonts } from 'expo-font'
import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'

import { authClient } from '@/lib/auth-client'
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  )
}
