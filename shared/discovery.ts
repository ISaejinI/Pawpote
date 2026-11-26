export const DOG_SIZES = ['small', 'medium', 'large'] as const
export const DOG_AGES = ['puppy', 'young', 'adult', 'senior'] as const
export const DOG_SEXES = ['female', 'male'] as const
export const MIN_DISCOVERY_RADIUS_KM = 1
export const MAX_DISCOVERY_RADIUS_KM = 50

export type DogSize = typeof DOG_SIZES[number]
export type DogAge = typeof DOG_AGES[number]
export type DogSex = typeof DOG_SEXES[number]
export type Coordinates = { latitude: number; longitude: number }
export type DiscoveryFilters = {
  sizes: DogSize[]
  ages: DogAge[]
  sex: DogSex | null
  nearby: boolean
  radiusKm?: number
}

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  sizes: [],
  ages: [],
  sex: null,
  nearby: false,
}

export type DiscoveryDog = {
  id: string
  name: string
  breed: string | null
  age: number | null
  favoriteToy: string | null
  photo: string | null
  distanceKm?: number | null
  distanceApproximate?: boolean
}

export type DogDetails = DiscoveryDog & {
  sex: DogSex | null
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
