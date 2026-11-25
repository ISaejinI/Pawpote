import { Redirect } from 'expo-router'

/** Entrée de l'onboarding : première étape. */
export default function OnboardingIndex() {
  return <Redirect href="/onboarding/dog" />
}
