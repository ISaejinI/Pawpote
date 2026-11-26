import { createContext, use, useState, type ReactNode } from 'react';
import type { Coordinates } from '../../shared/discovery';

export type DogSex = 'female' | 'male';

/** Fiche d'un chien en cours de saisie (étapes 1 à 4). */
export type DogDraft = {
  name: string;
  sex: DogSex | null;
  /** « JJ / MM / AAAA » */
  birthDate: string;
  breed: { id: number | null; name: string } | null;
  mainPhoto: string | null;
  /** Trois emplacements de photos secondaires. */
  extraPhotos: (string | null)[];
  traits: string[];
  quirk: string;
  favoriteToy: string;
  activities: string[];
  description: string;
};

/** Infos du maître (étape 6). */
export type OwnerDraft = {
  photo: string | null;
  birthDate: string;
  address: string;
  postalCode: string;
  city: string;
  homeLocation?: Coordinates | null;
};

type OnboardingDraft = {
  dogs: DogDraft[];
  /** Index du chien en cours de saisie. */
  currentDog: number;
  /** Identifiants des parcs choisis (étape 5). */
  parks: string[];
  owner: OwnerDraft;
};

function emptyDog(): DogDraft {
  return {
    name: '',
    sex: null,
    birthDate: '',
    breed: null,
    mainPhoto: null,
    extraPhotos: [null, null, null],
    traits: [],
    quirk: '',
    favoriteToy: '',
    activities: [],
    description: '',
  };
}

const initialDraft: OnboardingDraft = {
  dogs: [emptyDog()],
  currentDog: 0,
  parks: [],
  owner: { photo: null, birthDate: '', address: '', postalCode: '', city: '' },
};

type OnboardingDraftValue = {
  dog: DogDraft;
  /** Tous les chiens saisis, dans l'ordre. */
  dogs: DogDraft[];
  owner: OwnerDraft;
  parks: string[];
  updateDog: (patch: Partial<DogDraft>) => void;
  updateOwner: (patch: Partial<OwnerDraft>) => void;
  setParks: (parks: string[]) => void;
  /** Ajoute un chien vide et le rend courant. */
  startNewDog: () => void;
};

const OnboardingDraftContext = createContext<OnboardingDraftValue | null>(null);

/**
 * Garde en mémoire les réponses de l'onboarding d'une étape à l'autre.
 * Rien n'est envoyé avant la dernière étape : tout est enregistré en une fois avec « Commencer à swiper ».
 */
export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(initialDraft);

  const value: OnboardingDraftValue = {
    dog: draft.dogs[draft.currentDog],
    dogs: draft.dogs,
    owner: draft.owner,
    parks: draft.parks,
    updateDog: (patch) =>
      setDraft((current) => ({
        ...current,
        dogs: current.dogs.map((dog, index) =>
          index === current.currentDog ? { ...dog, ...patch } : dog,
        ),
      })),
    updateOwner: (patch) =>
      setDraft((current) => ({ ...current, owner: { ...current.owner, ...patch } })),
    setParks: (parks) => setDraft((current) => ({ ...current, parks })),
    startNewDog: () =>
      setDraft((current) => ({
        ...current,
        dogs: [...current.dogs, emptyDog()],
        currentDog: current.dogs.length,
      })),
  };

  return <OnboardingDraftContext value={value}>{children}</OnboardingDraftContext>;
}

export function useOnboardingDraft() {
  const value = use(OnboardingDraftContext);
  if (!value) throw new Error('useOnboardingDraft doit être utilisé dans OnboardingDraftProvider');
  return value;
}

/** Ajoute ou retire une valeur d'une liste de choix multiples. */
export function toggleValue<T>(list: readonly T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
