import * as SecureStore from 'expo-secure-store';
import { createContext, use, useState, type ReactNode } from 'react';

/**
 * Indique si l'utilisateur connecté doit passer par l'onboarding.
 *
 * Règle visée : onboarding tant que l'utilisateur n'a pas de ligne `profiles` ni de chien.
 * L'API n'expose pas encore ces tables : en attendant, la fin de l'onboarding
 * est mémorisée sur l'appareil, par utilisateur. À remplacer par un appel à l'API.
 */
type OnboardingStatusValue = {
  needsOnboarding: boolean;
  /** À appeler à la fin de l'onboarding. */
  completeOnboarding: () => void;
};

const OnboardingStatusContext = createContext<OnboardingStatusValue | null>(null);

function storageKey(userId: string) {
  // SecureStore n'accepte que les lettres, chiffres, « . », « - » et « _ »
  return `pawpote.onboarding-complete.${userId.replace(/[^\w.-]/g, '_')}`;
}

function readCompleted(userId: string) {
  try {
    return SecureStore.getItem(storageKey(userId)) === 'true';
  } catch {
    return false;
  }
}

export function OnboardingStatusProvider({
  userId,
  children,
}: {
  /** Utilisateur connecté, ou `undefined` sans session. */
  userId: string | undefined;
  children: ReactNode;
}) {
  // Fins d'onboarding de la session en cours, en plus de celles lues sur l'appareil
  const [completedNow, setCompletedNow] = useState<string[]>([]);

  const completed = !!userId && (completedNow.includes(userId) || readCompleted(userId));

  const value: OnboardingStatusValue = {
    needsOnboarding: !!userId && !completed,
    completeOnboarding: () => {
      if (!userId) return;
      try {
        SecureStore.setItem(storageKey(userId), 'true');
      } catch (error) {
        console.error('Onboarding status save error:', error);
      }
      setCompletedNow((current) => [...current, userId]);
    },
  };

  return <OnboardingStatusContext value={value}>{children}</OnboardingStatusContext>;
}

export function useOnboardingStatus() {
  const value = use(OnboardingStatusContext);
  if (!value) throw new Error('useOnboardingStatus doit être utilisé dans OnboardingStatusProvider');
  return value;
}
