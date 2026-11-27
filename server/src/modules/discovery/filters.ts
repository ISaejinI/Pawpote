import { sql, type SQL } from 'drizzle-orm'

import {
  DOG_AGES, DOG_SEXES, DOG_SIZES, MAX_DISCOVERY_RADIUS_KM, MIN_DISCOVERY_RADIUS_KM,
  type Coordinates, type DiscoveryFilters, type DogAge,
} from '../../../../shared/discovery'
import { profiles } from '../../db/schema'

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

export function matchesAge(age: SQL<number | null>, group: DogAge) {
  switch (group) {
    case 'puppy': return sql`${age} < 1`
    case 'young': return sql`${age} between 1 and 2`
    case 'adult': return sql`${age} between 3 and 7`
    case 'senior': return sql`${age} >= 8`
  }
}

const homeFallback = sql<boolean>`${profiles.latitude} is null and ${profiles.homeLatitude} is not null`

export function distanceFrom(origin: Coordinates | null) {
  if (!origin) return sql<number | null>`null::double precision`
  const latitude = sql`coalesce(${profiles.latitude}, ${profiles.homeLatitude})`
  const longitude = sql`coalesce(${profiles.longitude}, ${profiles.homeLongitude})`
  return sql<number | null>`case
    when ${latitude} is not null and ${longitude} is not null then
      6371 * acos(least(1, greatest(-1,
        sin(radians(${origin.latitude}::double precision)) * sin(radians(${latitude})) +
        cos(radians(${origin.latitude}::double precision)) * cos(radians(${latitude})) *
        cos(radians(${longitude} - ${origin.longitude}::double precision))
      )))
    end`
}

export function distanceForDisplay(distance: SQL<number | null>, hasOrigin: boolean) {
  return {
    // Au kilomètre près, et jamais moins de 1 km : la distance ne situe personne précisément
    distanceKm: sql<number | null>`greatest(1, round((${distance})::numeric))::double precision`,
    distanceApproximate: hasOrigin ? homeFallback : sql<boolean>`false`,
  }
}
