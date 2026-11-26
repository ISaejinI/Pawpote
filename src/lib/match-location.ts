import * as Location from 'expo-location'

import type { Coordinates } from '../../shared/discovery'

export async function getMatchPosition(): Promise<Coordinates> {
  const current = await Location.getForegroundPermissionsAsync()
  const permission = !current.granted && current.canAskAgain
    ? await Location.requestForegroundPermissionsAsync()
    : current

  if (!permission.granted) {
    throw new Error(permission.canAskAgain
      ? 'Autorise la localisation pour utiliser la recherche autour de toi.'
      : 'Autorise la localisation de PawPote dans les paramètres de ton appareil.')
  }

  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Position indisponible')), 15_000)
      }),
    ])
    const { latitude, longitude } = position.coords
    return { latitude, longitude }
  } catch {
    throw new Error('Position indisponible. Vérifie que la localisation est activée et réessaie.')
  } finally {
    if (timeout !== undefined) clearTimeout(timeout)
  }
}
