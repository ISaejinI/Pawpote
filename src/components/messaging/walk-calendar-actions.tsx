import { File, Paths } from 'expo-file-system'
import { openURL } from 'expo-linking'
import * as Sharing from 'expo-sharing'
import { useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { createWalkCalendarFile, googleCalendarUrl, type WalkCalendarEvent } from '@/lib/walk-calendar'
import { colors, spacing, typography } from '@/theme'

const filename = 'balade-pawpote.ics'
const mimeType = 'text/calendar'

export function WalkCalendarActions({ event }: { event: WalkCalendarEvent }) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  async function openGoogleCalendar() {
    setError('')
    try {
      await openURL(googleCalendarUrl(event))
    } catch {
      setError('Impossible d’ouvrir Google Agenda. Tu peux exporter le fichier .ics.')
    }
  }

  async function exportCalendarFile() {
    setExporting(true)
    setError('')
    try {
      const contents = createWalkCalendarFile(event)
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([contents], { type: mimeType }))
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        return
      }

      if (!(await Sharing.isAvailableAsync())) throw new Error('Partage indisponible.')
      const file = new File(Paths.cache, `balade-pawpote-${event.id}.ics`)
      file.create({ overwrite: true })
      await file.write(contents)
      await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: 'Exporter la balade' })
    } catch {
      setError('Impossible d’exporter le fichier .ics.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <View style={styles.actions}>
      <Button variant="secondary" size="xs" icon="calendar" onPress={openGoogleCalendar}>
        Ajouter à Google Agenda
      </Button>
      <Button variant="secondary" size="xs" loading={exporting} onPress={exportCalendarFile}>
        Exporter le fichier .ics
      </Button>
      {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { marginTop: spacing[2], gap: spacing[2] },
  error: { ...typography.small, color: colors.danger },
})
