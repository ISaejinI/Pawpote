import { dogCompletion, type CompletionInput } from '../profile'

const EMPTY: CompletionInput = {
  hasPhoto: false,
  hasSex: false,
  hasBirthDate: false,
  hasBreed: false,
  traitCount: 0,
  quirk: null,
  favoriteToy: null,
  activityCount: 0,
  description: null,
}

describe('dogCompletion', () => {
  it('liste tout ce qui manque, dans l’ordre de la fiche, pour une fiche vide', () => {
    expect(dogCompletion(EMPTY)).toEqual({
      value: 0,
      missing: [
        'photo', 'sex', 'birthDate', 'breed', 'traits', 'quirk', 'favoriteToy', 'activities', 'description',
      ],
    })
  })

  it('vaut 100 % pour une fiche complète', () => {
    const complete = dogCompletion({
      hasPhoto: true,
      hasSex: true,
      hasBirthDate: true,
      hasBreed: true,
      traitCount: 2,
      quirk: 'Ronfle fort',
      favoriteToy: 'Sa balle',
      activityCount: 1,
      description: 'Un amour de chien',
    })
    expect(complete).toEqual({ value: 1, missing: [] })
  })

  it('ne compte pas un texte fait seulement d’espaces', () => {
    const { value, missing } = dogCompletion({ ...EMPTY, hasPhoto: true, description: '   ' })
    expect(missing).toContain('description')
    expect(value).toBeCloseTo(1 / 9)
  })
})
