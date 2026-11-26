import { ONBOARDING_LIMITS } from '@/data/onboarding-options'
import type { Coordinates } from '../../shared/discovery'
import { approximateHomeLocation, readCoordinates } from '../../shared/location'

export type AddressSuggestion = {
  address: string
  postalCode: string
  city: string
  homeLocation: Coordinates | null
}

type AddressFeature = {
  properties?: { name?: unknown; postcode?: unknown; city?: unknown; type?: unknown }
  geometry?: { type?: unknown; coordinates?: unknown }
}

const SUGGESTION_LIMIT = 5

export async function searchAddresses(query: string, signal: AbortSignal): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    index: 'address',
    autocomplete: '1',
    type: 'housenumber',
    limit: String(SUGGESTION_LIMIT),
  })
  const response = await fetch(`https://data.geopf.fr/geocodage/search?${params.toString()}`, { signal })
  if (!response.ok) throw new Error('Address lookup unavailable')

  const { features }: { features: AddressFeature[] } = await response.json()
  if (!Array.isArray(features)) throw new Error('Invalid address response')

  const suggestions = new Map<string, AddressSuggestion>()
  for (const feature of features) {
    const properties = feature?.properties
    if (properties?.type !== 'housenumber') continue

    const { name, postcode, city: rawCity } = properties
    if (typeof name !== 'string' || typeof postcode !== 'string' || typeof rawCity !== 'string') continue

    const address = name.trim()
    const city = rawCity.trim()
    if (!address || address.length > ONBOARDING_LIMITS.address ||
      !city || city.length > ONBOARDING_LIMITS.city || !/^\d{5}$/.test(postcode)) continue

    const point = feature.geometry
    const coordinates = point?.type === 'Point' && Array.isArray(point.coordinates)
      ? readCoordinates({ latitude: point.coordinates[1], longitude: point.coordinates[0] })
      : null
    const entry = {
      address,
      postalCode: postcode,
      city,
      homeLocation: coordinates ? approximateHomeLocation(coordinates) : null,
    }
    const key = addressSuggestionKey(entry)
    if (!suggestions.get(key)?.homeLocation) suggestions.set(key, entry)
  }
  return [...suggestions.values()].slice(0, SUGGESTION_LIMIT)
}

export function addressSuggestionKey({ address, postalCode, city }: AddressSuggestion) {
  return `${address}|${postalCode}|${city}`
}
