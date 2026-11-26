import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { getOnboardingStatus } from './onboarding-api';

/**
 * Indique si l'utilisateur connecté doit passer par l'onboarding.
 *
 * Règle : onboarding tant que l'utilisateur n'a aucun chien en base (`GET /api/onboarding`).
 * La réponse positive est gardée sur l'appareil : l'API n'est interrogée qu'une fois par compte.
 */
type OnboardingStatusValue = {
  /** Vérification en cours auprès de l'API. */
  isLoading: boolean;
  needsOnboarding: boolean;
  /** À appeler une fois l'onboarding enregistré en base. */
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

function saveCompleted(userId: string) {
  try {
    SecureStore.setItem(storageKey(userId), 'true');
  } catch (error) {
    console.error('Onboarding status save error:', error);
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
  // Réponses de l'API, par utilisateur
  const [serverStatus, setServerStatus] = useState<Record<string, boolean>>({});

  const completed = !!userId && (serverStatus[userId] === true || readCompleted(userId));
  const isLoading = !!userId && !completed && serverStatus[userId] === undefined;

  useEffect(() => {
    if (!userId || !isLoading) return;
    let cancelled = false;

    getOnboardingStatus()
      .then(({ completed: done }) => {
        if (done) saveCompleted(userId);
        return done;
      })
      .catch((error: unknown) => {
        // API injoignable : on passe par l'onboarding. S'il était déjà fait,
        // l'API le signale à l'enregistrement et l'app bascule vers les onglets.
        console.error('Onboarding status error:', error);
        return false;
      })
      .then((done) => {
        if (!cancelled) setServerStatus((current) => ({ ...current, [userId]: done }));
      });

    return () => {
      cancelled = true;
    };
  }, [userId, isLoading]);

  const value: OnboardingStatusValue = {
    isLoading,
    needsOnboarding: !!userId && !completed && !isLoading,
    completeOnboarding: () => {
      if (!userId) return;
      saveCompleted(userId);
      setServerStatus((current) => ({ ...current, [userId]: true }));
    },
  };

  return <OnboardingStatusContext value={value}>{children}</OnboardingStatusContext>;
}

export function useOnboardingStatus() {
  const value = use(OnboardingStatusContext);
  if (!value) throw new Error('useOnboardingStatus doit être utilisé dans OnboardingStatusProvider');
  return value;
}
