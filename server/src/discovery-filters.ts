import { sql, type SQL } from 'drizzle-orm'

import {
  DOG_AGES, DOG_SEXES, DOG_SIZES, MAX_DISCOVERY_RADIUS_KM, MIN_DISCOVERY_RADIUS_KM,
  type Coordinates, type DiscoveryFilters, type DogAge,
} from '../../shared/discovery'
import { profiles } from './db/schema'

function readChoices<T extends string>(value: string | undefined, allowed: readonly T[]): T[] | null {
  if (value === undefined) return []
  const choices = value.split(',')
  if (!choices.every((choice): choice is T => allowed.some((item) => item === choice))) return null
  return [...new Set(choices)]
}

export function readDiscoveryFilters(query: Record<string, string>): DiscoveryFilters | null {
  const sizes = readChoices(query.sizes, DOG_SIZES)
  const ages = readChoices(query.ages, DOG_AGES)
  const sex = DOG_SEXES.find((value) => value === query.sex) ?? null
  const radiusKm = query.radiusKm === undefined ? undefined : Number(query.radiusKm)
  if (!sizes || !ages || (query.sex !== undefined && !sex)) return null
  if (query.nearby !== undefined && query.nearby !== '1') return null
  if (radiusKm !== undefined && (!Number.isInteger(radiusKm) ||
    radiusKm < MIN_DISCOVERY_RADIUS_KM || radiusKm > MAX_DISCOVERY_RADIUS_KM)) return null

  return { sizes, ages, sex, nearby: query.nearby === '1' || radiusKm !== undefined, radiusKm }
}

export function readCoordinates(input: unknown): Coordinates | null {
  if (!input || typeof input !== 'object') return null
  const { latitude, longitude } = input as Partial<Coordinates>
  if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

export function matchesAge(age: SQL<number | null>, group: DogAge) {
  switch (group) {
    case 'puppy': return sql`${age} < 1`
    case 'young': return sql`${age} between 1 and 2`
    case 'adult': return sql`${age} between 3 and 7`
    case 'senior': return sql`${age} >= 8`
  }
}

export function distanceForDisplay(distance: SQL<number | null>) {
  return sql<number | null>`round((${distance})::numeric, 1)::double precision`
}

export function distanceFrom(origin: Coordinates | null) {
  if (!origin) return sql<number | null>`null::double precision`
  return sql<number | null>`case
    when ${profiles.latitude} is not null and ${profiles.longitude} is not null then
      6371 * acos(least(1, greatest(-1,
        sin(radians(${origin.latitude}::double precision)) * sin(radians(${profiles.latitude})) +
        cos(radians(${origin.latitude}::double precision)) * cos(radians(${profiles.latitude})) *
        cos(radians(${profiles.longitude} - ${origin.longitude}::double precision))
      )))
    end`
}
