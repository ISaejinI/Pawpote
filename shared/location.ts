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

export function approximateHomeLocation({ latitude, longitude }: Coordinates): Coordinates {
  return {
    latitude: Math.round(latitude * GRID_STEPS_PER_DEGREE) / GRID_STEPS_PER_DEGREE,
    longitude: Math.round(longitude * GRID_STEPS_PER_DEGREE) / GRID_STEPS_PER_DEGREE,
  }
}
