export type DiscoveryDog = {
  id: string
  name: string
  breed: string | null
  age: number | null
  favoriteToy: string | null
  photo: string | null
}

export type DogDetails = DiscoveryDog & {
  sex: 'female' | 'male' | null
  description: string | null
  quirk: string | null
  photos: string[]
  traits: string[]
  activities: string[]
  owner: { firstName: string; photo: string | null }
  photoCredits: { author: string; license: string; file: string }[]
}

export type DiscoveryFeed = { dogs: DiscoveryDog[]; canRestart: boolean }
export type SwipeAction = 'like' | 'dislike'
export type SwipeResult = { matches: { id: string; ownDog: string; targetDog: string }[] }
