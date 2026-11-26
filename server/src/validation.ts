import { isOwnPhotoKey } from './storage'

/** Validation des corps de requête JSON, commune aux routes. */

export class InvalidPayload extends Error {}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** Texte nettoyé, obligatoire sauf `optional`, borné à `max` caractères. */
export function readText(source: Record<string, unknown>, key: string, max: number, optional = false) {
  const value = source[key]
  if (optional && (value === null || value === undefined)) return null
  if (typeof value !== 'string') throw new InvalidPayload(`${key} invalide.`)
  const text = value.trim()
  if (!text) {
    if (optional) return null
    throw new InvalidPayload(`${key} manquant.`)
  }
  if (text.length > max) throw new InvalidPayload(`${key} trop long.`)
  return text
}

/** Date AAAA-MM-JJ existante, passée, et d'au plus `maxAge` ans. */
export function readBirthDate(source: Record<string, unknown>, key: string, maxAge: number) {
  const value = source[key]
  const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null
  if (!match) throw new InvalidPayload(`${key} invalide.`)

  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const today = new Date()
  const exists = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  if (!exists || date > today || today.getUTCFullYear() - year > maxAge) {
    throw new InvalidPayload(`${key} invalide.`)
  }
  return value as string
}

/** Liste de choix sans doublon, prise dans `allowed`. */
export function readChoices(source: Record<string, unknown>, key: string, allowed: readonly string[], min: number) {
  const value = source[key]
  if (!Array.isArray(value) || value.some((item) => !allowed.includes(item))) {
    throw new InvalidPayload(`${key} invalide.`)
  }
  const choices = [...new Set(value as string[])]
  if (choices.length < min) throw new InvalidPayload(`${key} manquant.`)
  return choices
}

/** Liste de clés de photos envoyées par cet utilisateur, sans doublon. */
export function readPhotoKeys(userId: string, value: unknown, min: number, max: number) {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new InvalidPayload('photos invalides.')
  }
  if (!value.every((key) => isOwnPhotoKey(userId, key)) || new Set(value).size !== value.length) {
    throw new InvalidPayload('photos invalides.')
  }
  return value as string[]
}
