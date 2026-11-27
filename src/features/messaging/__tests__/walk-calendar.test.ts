import { createWalkCalendarFile, googleCalendarUrl } from '../walk-calendar'

const walk = {
  id: '20d71b76-7a96-4785-badb-eefbb73e82da',
  startsAt: '2026-12-01T23:30:00+01:00',
  minutes: 90,
  place: 'Parc André, entrée nord; près du kiosque',
  ownDog: 'Vasco',
  otherDog: 'Nala',
}

describe('export de balade', () => {
  it('préremplit Google Agenda avec le titre, la description, le lieu et les horaires UTC', () => {
    const { searchParams } = new URL(googleCalendarUrl(walk))
    expect(searchParams.get('dates')).toBe('20261201T223000Z/20261202T000000Z')
    expect(searchParams.get('location')).toBe(walk.place)
    expect(searchParams.get('text')).toBe('Balade avec Nala')
    expect(searchParams.get('details')).toBe('Balade de 90 min avec Vasco et Nala, organisée sur Pawpote.')
  })

  it('génère un événement iCalendar avec un identifiant stable', () => {
    const file = createWalkCalendarFile(walk)
    expect(file).toContain(`UID:${walk.id}@pawpote\r\n`)
    expect(file).toContain('DTSTART:20261201T223000Z\r\nDTEND:20261202T000000Z\r\n')
    expect(file).toContain('SUMMARY:Balade avec Nala\r\n')
    expect(file.replace(/\r\n /g, '')).toContain('DESCRIPTION:Balade de 90 min avec Vasco et Nala\\, organisée sur Pawpote.\r\n')
    expect(file).toContain('LOCATION:Parc André\\, entrée nord\\; près du kiosque\r\n')
    expect(file.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })

  it('replie un lieu long en UTF-8 et échappe les retours à la ligne', () => {
    const place = 'École 🐶 '.repeat(10) + '\nRendez-vous à l’entrée'
    const file = createWalkCalendarFile({ ...walk, place })
    for (const line of file.split('\r\n')) {
      const bytes = encodeURIComponent(line).replace(/%[A-F\d]{2}/g, ' ')
      expect(bytes.length).toBeLessThanOrEqual(75)
    }
    expect(file.replace(/\r\n /g, '')).toContain(`LOCATION:${place.replace('\n', '\\n')}\r\n`)
  })
})
