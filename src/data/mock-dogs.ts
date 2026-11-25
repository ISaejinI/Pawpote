
export type MockDog = {
  id: string
  name: string
  age: number
  breed: string
  description: string
  image: string
}

export const mockDogs: MockDog[] = [
  {
    id: '1',
    name: 'Oslo',
    age: 2,
    breed: 'Golden Retriever',
    description: 'J’adore les longues balades !',
    image: 'https://picsum.photos/seed/pawpote-oslo/600/600',
  },
  {
    id: '2',
    name: 'Nala',
    age: 3,
    breed: 'Border Collie',
    description: 'Toujours prête à jouer.',
    image: 'https://picsum.photos/seed/pawpote-nala/600/600',
  },
  {
    id: '3',
    name: 'Rocky',
    age: 1,
    breed: 'Berger Australien',
    description: 'Une vraie boule d’énergie !',
    image: 'https://picsum.photos/seed/pawpote-rocky/600/600',
  },
  {
    id: '4',
    name: 'Luna',
    age: 4,
    breed: 'Husky',
    description: 'Fan de promenades en forêt.',
    image: 'https://picsum.photos/seed/pawpote-luna/600/600',
  },
  {
    id: '5',
    name: 'Max',
    age: 2,
    breed: 'Labrador',
    description: 'Je cherche des copains !',
    image: 'https://picsum.photos/seed/pawpote-max/600/600',
  },
]
