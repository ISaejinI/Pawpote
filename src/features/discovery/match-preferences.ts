import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  DEFAULT_DISCOVERY_FILTERS, DOG_AGES, DOG_SEXES, DOG_SIZES,
  MAX_DISCOVERY_RADIUS_KM, MIN_DISCOVERY_RADIUS_KM, type DiscoveryFilters,
} from '@shared/discovery'

function preferencesKey(userId: string) {
  return `pawpote.match-preferences.v1.${userId}`
}

function readChoices<T extends string>(input: unknown, choices: readonly T[]) {
  return Array.isArray(input) ? choices.filter((choice) => input.includes(choice)) : []
}

export async function readMatchPreferences(userId: string) {
  try {
    const saved = await AsyncStorage.getItem(preferencesKey(userId))
    if (saved) {
      const { sizes, ages, sex, nearby, radiusKm }: Partial<DiscoveryFilters> = JSON.parse(saved)
      return {
        sizes: readChoices(sizes, DOG_SIZES),
        ages: readChoices(ages, DOG_AGES),
        sex: DOG_SEXES.find((choice) => choice === sex) ?? null,
        nearby: nearby === true,
        radiusKm: nearby === true && radiusKm !== undefined && Number.isInteger(radiusKm) &&
          radiusKm >= MIN_DISCOVERY_RADIUS_KM && radiusKm <= MAX_DISCOVERY_RADIUS_KM ? radiusKm : undefined,
      } satisfies DiscoveryFilters
    }
  } catch {
    // Un stockage indisponible ne bloque pas la découverte.
  }
  return null
}

export async function saveMatchPreferences(userId: string, filters = DEFAULT_DISCOVERY_FILTERS) {
  await AsyncStorage.setItem(preferencesKey(userId), JSON.stringify(filters))
}
