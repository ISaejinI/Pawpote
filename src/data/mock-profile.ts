import { colors } from '@/theme';

/**
 * Données fictives de l'onglet Profil, reprises de la maquette.
 * À remplacer par l'API quand le profil sera branché.
 */

export type MockProfileDog = {
  id: string;
  name: string;
  breed: string;
  age: number;
  photoUri: string | null;
  /** Fond de la photo tant qu'elle manque. */
  color: string;
  /** Complétion de la fiche, entre 0 et 1. */
  completion: number;
};

const ALL_DOGS: MockProfileDog[] = [
  {
    id: 'biscotte',
    name: 'Biscotte',
    breed: 'Berger australien',
    age: 3,
    photoUri: null,
    color: colors.peach300,
    completion: 0.7,
  },
  {
    id: 'pistache',
    name: 'Pistache',
    breed: 'Teckel',
    age: 6,
    photoUri: null,
    color: colors.lime500,
    completion: 1,
  },
];

/**
 * Nombre de chiens affichés : 1 pour la variante « un chien »,
 * 2 pour la variante « plusieurs chiens ».
 */
const MOCK_DOG_COUNT = 2;

export const MOCK_PROFILE_DOGS = ALL_DOGS.slice(0, MOCK_DOG_COUNT);

export const MOCK_OWNER = {
  firstName: 'Camille',
  photoUri: null,
  color: colors.lavender200,
};

/** Nombre de parcs favoris (ligne « Mes parcs »). */
export const MOCK_PARK_COUNT = 2;

/** « Berger australien · 3 ans ». */
export function dogDetails(dog: Pick<MockProfileDog, 'breed' | 'age'>) {
  return `${dog.breed} · ${dog.age} an${dog.age > 1 ? 's' : ''}`;
}
