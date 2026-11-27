/** Listes de choix de l'onboarding. Traits et activités sont partagés avec l'API. */
export { ACTIVITIES, ONBOARDING_LIMITS, TRAITS } from '@shared/onboarding';

/** Parcs fictifs en attendant la recherche géolocalisée. */
export const MOCK_PARKS = [
  { id: 'berges', name: 'Parc des Berges', distance: 'à 600 m' },
  { id: 'colline', name: 'Bois de la Colline', distance: 'à 1,4 km' },
  { id: 'tilleuls', name: 'Square des Tilleuls', distance: 'à 2 km' },
  { id: 'lac', name: 'Parc canin du Lac', distance: 'à 3,5 km' },
] as const;
