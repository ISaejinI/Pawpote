/**
 * Listes de choix de l'onboarding, reprises de la maquette.
 * À remplacer par les tables `characters` et `activities` quand l'API les exposera.
 */
export const TRAITS = [
  'Joueur',
  'Calme',
  'Câlin',
  'Timide',
  'Foufou',
  'Curieux',
  'Gourmand',
  'Protecteur',
  'Sociable',
  'Indépendant',
  'Têtu',
  'Bavard',
] as const;

export const ACTIVITIES = [
  'Balade en forêt',
  'Course',
  'Baignade',
  'Jeu de balle',
  'Randonnée',
  'Parc à chiens',
  'Plage',
  'Agility',
] as const;

/** Parcs fictifs en attendant la recherche géolocalisée. */
export const MOCK_PARKS = [
  { id: 'berges', name: 'Parc des Berges', distance: 'à 600 m' },
  { id: 'colline', name: 'Bois de la Colline', distance: 'à 1,4 km' },
  { id: 'tilleuls', name: 'Square des Tilleuls', distance: 'à 2 km' },
  { id: 'lac', name: 'Parc canin du Lac', distance: 'à 3,5 km' },
] as const;
