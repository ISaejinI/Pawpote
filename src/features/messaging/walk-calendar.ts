import type { WalkDraft } from '@shared/messaging'
import { readChatTimestamp } from './message-dates'

export type WalkCalendarEvent = WalkDraft & { id: string; ownDog: string; otherDog: string }

function eventCopy({ ownDog, otherDog, minutes }: WalkCalendarEvent) {
  return {
    title: `Balade avec ${otherDog}`,
    description: `Balade de ${minutes} min avec ${ownDog} et ${otherDog}, organisée sur Pawpote.`,
  }
}

function calendarDate(timestamp: number) {
  return new Date(timestamp).toISOString().replace(/[-:]|\.\d{3}/g, '')
}

function eventDates({ startsAt, minutes }: WalkCalendarEvent) {
  const start = readChatTimestamp(startsAt)
  if (start === undefined) throw new Error('Date de balade invalide.')
  return { start: calendarDate(start), end: calendarDate(start + minutes * 60_000) }
}

export function googleCalendarUrl(event: WalkCalendarEvent) {
  const { start, end } = eventDates(event)
  const { title, description } = eventCopy(event)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    location: event.place,
    details: description,
  })
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`
}

function escapeCalendarText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, '\\$&')
}

function foldCalendarLine(line: string) {
  let result = ''
  let bytes = 0
  for (const character of line) {
    const codePoint = character.codePointAt(0)!
    const width = codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
    if (bytes + width > 75) {
      result += '\r\n '
      bytes = 1
    }
    result += character
    bytes += width
  }
  return result
}

export function createWalkCalendarFile(event: WalkCalendarEvent) {
  const { start, end } = eventDates(event)
  const { title, description } = eventCopy(event)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pawpote//Walks//FR',
    'BEGIN:VEVENT',
    `UID:${escapeCalendarText(event.id)}@pawpote`,
    `DTSTAMP:${calendarDate(Date.now())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeCalendarText(title)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `LOCATION:${escapeCalendarText(event.place)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].map(foldCalendarLine).join('\r\n')
}
