import type { Coordinates } from './discovery'

export function readCoordinates(input: unknown): Coordinates | null {
  if (!input || typeof input !== 'object') return null
  const { latitude, longitude } = input as Partial<Coordinates>
  if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

// Cellules de 0,005° de côté, soit environ 500 m en France métropolitaine.
const GRID_STEPS_PER_DEGREE = 200

/**
 * Ramène une position au centre de sa cellule d'environ 500 m. Les positions (adresse et GPS) sont
 * enregistrées ainsi : les distances calculées ne permettent pas de retrouver un domicile.
 */
export function approximateLocation({ latitude, longitude }: Coordinates): Coordinates {
  return {
    latitude: Math.round(latitude * GRID_STEPS_PER_DEGREE) / GRID_STEPS_PER_DEGREE,
    longitude: Math.round(longitude * GRID_STEPS_PER_DEGREE) / GRID_STEPS_PER_DEGREE,
  }
}
