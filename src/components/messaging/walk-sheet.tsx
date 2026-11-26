import { useState } from 'react'
import { Keyboard, StyleSheet, Text, View } from 'react-native'

import { BottomSheet, Button, FormField, Input } from '@/components/ui'
import { colors, spacing, typography } from '@/theme'
import { MAX_WALK_PLACE_LENGTH, type WalkDraft } from '../../../shared/messaging'
import { WalkDateTimePicker } from './walk-date-time-picker'

type Props = {
  visible: boolean
  onClose: () => void
  onSubmit: (walk: WalkDraft) => Promise<void>
  initial?: Pick<WalkDraft, 'place' | 'minutes'>
}

export function WalkSheet({ visible, onClose, onSubmit, initial }: Props) {
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<Date | null>(null)
  const [minimumDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [place, setPlace] = useState(initial?.place ?? '')
  const [duration, setDuration] = useState(String(initial?.minutes ?? 60))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    const minutes = Number(duration)
    if (!date || !time) {
      setError('Renseigne une date et une heure valides.')
      return
    }
    const start = new Date(date)
    const hours = time.getHours()
    const startMinutes = time.getMinutes()
    start.setHours(hours, startMinutes, 0, 0)
    if (!Number.isFinite(start.getTime()) || start.getTime() <= Date.now() ||
      start.getHours() !== hours || start.getMinutes() !== startMinutes) {
      setError('Choisis une date et une heure valides dans le futur.')
      return
    }
    if (!place.trim() || !Number.isInteger(minutes) || minutes < 15 || minutes > 480) {
      setError('Renseigne un lieu et une durée de 15 à 480 minutes.')
      return
    }
    Keyboard.dismiss()
    setError('')
    setSaving(true)
    try {
      await onSubmit({ startsAt: start.toISOString(), place: place.trim(), minutes })
    } catch {
      setError('Impossible d’envoyer cette proposition. Réessaie.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={() => { if (!saving) onClose() }}
      title={initial ? 'Proposer une autre date' : 'Proposer une balade'}
      keyboardAware
      footer={(
        <View style={styles.fields}>
          {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
          <Button loading={saving} onPress={() => { void submit() }}>Envoyer la proposition</Button>
        </View>
      )}
    >
      <View style={styles.fields}>
        <WalkDateTimePicker
          date={date}
          time={time}
          minimumDate={minimumDate}
          disabled={saving}
          onDate={setDate}
          onTime={setTime}
        />
        <FormField label="Lieu du rendez-vous">
          <Input value={place} onChangeText={setPlace} placeholder="Nom du parc, point de rendez-vous…" maxLength={MAX_WALK_PLACE_LENGTH} editable={!saving} />
        </FormField>
        <FormField label="Durée en minutes">
          <Input value={duration} onChangeText={(text) => setDuration(text.replace(/\D/g, ''))}
            keyboardType="number-pad" maxLength={3} editable={!saving} />
        </FormField>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  fields: { gap: spacing[3], paddingBottom: spacing[2] },
  error: { ...typography.small, color: colors.danger },
})
