import { approximateLocation, readCoordinates } from '../location'

describe('readCoordinates', () => {
  it('accepte des coordonnées valides', () => {
    expect(readCoordinates({ latitude: 48.8566, longitude: 2.3522 })).toEqual({ latitude: 48.8566, longitude: 2.3522 })
  })

  it.each([
    ['absentes', null],
    ['en texte', { latitude: '48.8', longitude: '2.3' }],
    ['hors limites', { latitude: 91, longitude: 2 }],
    ['infinies', { latitude: Infinity, longitude: 2 }],
  ])('refuse des coordonnées %s', (_, input) => {
    expect(readCoordinates(input)).toBeNull()
  })
})

describe('approximateLocation', () => {
  it('arrondit une position à une grille d’environ 500 m pour ne pas révéler le domicile', () => {
    const home = { latitude: 48.85661, longitude: 2.35222 }
    const approximate = approximateLocation(home)

    expect(approximate).toEqual({ latitude: 48.855, longitude: 2.35 })
    // Deux voisins de la même rue tombent dans la même cellule
    expect(approximateLocation({ latitude: 48.8562, longitude: 2.3518 })).toEqual(approximate)
  })
})
