import { dateInputToIso, formatDateInput, isoToDateInput, parseDateInput, validateBirthDate } from '../dates'

describe('saisie des dates', () => {
  it('met en forme les chiffres tapés en « JJ / MM / AAAA »', () => {
    expect(formatDateInput('1203')).toBe('12 / 03')
    expect(formatDateInput('12/03/2021abc99')).toBe('12 / 03 / 2021')
  })

  it('refuse une date qui n’existe pas, comme un 31 février', () => {
    expect(parseDateInput('31 / 02 / 2021')).toBeNull()
    expect(parseDateInput('29 / 02 / 2024')).not.toBeNull()
  })

  it('convertit entre la saisie et le format de la base', () => {
    expect(dateInputToIso('05 / 09 / 2020')).toBe('2020-09-05')
    expect(isoToDateInput('2020-09-05')).toBe('05 / 09 / 2020')
    expect(dateInputToIso('pas une date')).toBeNull()
  })
})

describe('validateBirthDate', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 10, 26) })
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('accepte une date valide', () => {
    expect(validateBirthDate('12 / 03 / 2021', { maxAge: 30 })).toBeUndefined()
  })

  it.each([
    ['', 'Renseigne la date de naissance.'],
    ['31 / 02 / 2021', 'Cette date n’existe pas (format JJ / MM / AAAA).'],
    ['01 / 01 / 2027', 'Cette date est dans le futur.'],
    ['01 / 01 / 1980', 'Cette date semble trop ancienne.'],
  ])('refuse « %s »', (input, message) => {
    expect(validateBirthDate(input, { maxAge: 30 })).toBe(message)
  })
})
