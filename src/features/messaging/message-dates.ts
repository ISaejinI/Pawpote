export function readChatTimestamp(value: string | null) {
  if (typeof value !== 'string') return undefined
  // Supporte aussi le format PostgreSQL brut renvoyé avant la normalisation de l’API.
  const normalized = value
    .trim()
    .replace(/^(\d{4}-\d\d-\d\d) (\d\d:)/, '$1T$2')
    .replace(/(\.\d{3})\d+(?=Z|[+-]\d\d)/, '$1')
    .replace(/(T\d\d:\d\d:\d\d(?:\.\d+)?[+-]\d\d)$/, '$1:00')
  const timestamp = Date.parse(normalized)
  return Number.isFinite(timestamp) ? timestamp : undefined
}

export function formatChatDate(formatter: Intl.DateTimeFormat, value: string | null) {
  const timestamp = readChatTimestamp(value)
  return timestamp === undefined ? '' : formatter.format(timestamp)
}
