export type MockDog = {
  id: string
  name: string
  age: number
  sex: 'female' | 'male'
  breed: string
  /** Distance déjà mise en forme. */
  distance: string
  favoriteToy?: string
  /** « Son petit caractère » */
  quirk?: string
  traits: string[]
  activities: string[]
  description?: string
  parks: { name: string; shared?: boolean }[]
  owner: { firstName: string; photo?: string }
  /** Photo principale, affichée sur la carte de match. */
  image: string
  /** Photos secondaires, visibles sur la page de détail. */
  photos?: string[]
}

/** Chiens fictifs de l'écran de match, en attendant l'API. */
export const mockDogs: MockDog[] = [
  {
    id: '1',
    name: 'Oslo',
    age: 2,
    sex: 'male',
    breed: 'Boxer',
    distance: 'à 1,2 km',
    favoriteToy: 'la poule qui couine',
    quirk: 'Boude si la balade est trop courte',
    traits: ['Joueur', 'Câlin', 'Têtu'],
    activities: ['Balade en forêt', 'Jeu de balle'],
    description:
      'Oslo adore courir après les balles et rencontrer de nouveaux copains. Il préfère les balades d’au moins une heure, sinon il boude !',
    parks: [{ name: 'Parc des Berges', shared: true }, { name: 'Bois de la Colline' }],
    owner: { firstName: 'Camille' },
    image: 'https://www.les-chiens.com/wp-content/uploads/Boxer.png',
    photos: [
      'https://picsum.photos/seed/pawpote-oslo-2/800/800',
      'https://picsum.photos/seed/pawpote-oslo-3/800/800',
    ],
  },
  {
    id: '2',
    name: 'Nala',
    age: 3,
    sex: 'female',
    breed: 'Golden retriever',
    distance: 'à 800 m',
    favoriteToy: 'le frisbee jaune',
    traits: ['Sociable', 'Gourmande', 'Calme'],
    activities: ['Baignade', 'Plage'],
    description: 'Nala est une grande douce qui ne dit jamais non à une baignade.',
    parks: [{ name: 'Parc canin du Lac' }],
    owner: { firstName: 'Hugo' },
    image: 'https://cdn.shopify.com/s/files/1/0777/9362/4400/files/Golden_retriever.jpg?v=1762254880',
  },
  {
    id: '3',
    name: 'Rocky',
    age: 1,
    sex: 'male',
    breed: 'Berger australien',
    distance: 'à 2,5 km',
    quirk: 'Saute dans toutes les flaques',
    traits: ['Foufou', 'Curieux'],
    activities: ['Course', 'Agility', 'Parc à chiens'],
    description: 'Une vraie boule d’énergie qui cherche des copains pour se dépenser.',
    parks: [{ name: 'Square des Tilleuls', shared: true }],
    owner: { firstName: 'Inès' },
    image: 'https://monvet.com/wp-content/uploads/Chiens/Races/berger-australien-796x1024.jpg',
  },
  {
    id: '4',
    name: 'Luna',
    age: 4,
    sex: 'female',
    breed: 'Husky',
    distance: 'à 3 km',
    traits: ['Indépendante', 'Bavarde'],
    activities: ['Randonnée'],
    parks: [],
    owner: { firstName: 'Théo' },
    image: 'https://s3.animalia.bio/pets/animals/photos/full/1x1/IG46AqGW28l7f2Nl6OnQZfwRmXgurbWJtT4gBSvt.webp?id=42d1de859804af9db8d52d4a910f6986',
  },
  {
    id: '5',
    name: 'Max',
    age: 0,
    sex: 'male',
    breed: 'Labrador',
    distance: 'à 500 m',
    favoriteToy: 'sa vieille chaussette',
    quirk: 'Dit bonjour à tout le monde',
    traits: ['Joueur', 'Sociable'],
    activities: ['Jeu de balle'],
    description: 'Max découvre le monde et veut se faire plein d’amis.',
    parks: [{ name: 'Parc des Berges', shared: true }],
    owner: { firstName: 'Léa' },
    image: 'https://adoption.royalcanin.com/media/uploads/002a0f9e-668a-4cab-a1db-9b85a73c4dcf-451x800.jpeg',
  },
]

export function findMockDog(id: string) {
  return mockDogs.find((dog) => dog.id === id)
}
