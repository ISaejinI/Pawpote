import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { Button, FormField, Icon } from '@/components/ui'
import { borderWidth, colors, radius, spacing, typography } from '@/theme'

export type WalkDateTimePickerProps = {
  date: Date | null
  time: Date | null
  minimumDate: Date
  disabled: boolean
  onDate: (date: Date | null) => void
  onTime: (time: Date | null) => void
}

const dateLabel = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const timeLabel = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
type Mode = 'date' | 'time'

export function WalkDateTimePicker({ date, time, minimumDate, disabled, onDate, onTime }: WalkDateTimePickerProps) {
  const [draft, setDraft] = useState<{ mode: Mode; value: Date }>()

  function open(mode: Mode) {
    Keyboard.dismiss()
    const value = (mode === 'date' ? date : time) ?? new Date()
    const onSelect = mode === 'date' ? onDate : onTime
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        ...(mode === 'date' ? { minimumDate } : { is24Hour: true }),
        onValueChange: (_, picked) => onSelect(picked),
      })
    } else {
      setDraft({ mode, value })
    }
  }

  function confirm() {
    if (!draft) return
    const onSelect = draft.mode === 'date' ? onDate : onTime
    onSelect(draft.value)
    setDraft(undefined)
  }

  return (
    <View style={styles.group}>
      <View style={styles.row}>
        <FormField label="Date" style={styles.field}>
          <PickerButton mode="date" value={date} disabled={disabled} onPress={() => open('date')} />
        </FormField>
        <FormField label="Heure" style={styles.field}>
          <PickerButton mode="time" value={time} disabled={disabled} onPress={() => open('time')} />
        </FormField>
      </View>
      {draft && (
        <View style={styles.panel}>
          <DateTimePicker
            key={draft.mode}
            value={draft.value}
            mode={draft.mode}
            display="spinner"
            minimumDate={draft.mode === 'date' ? minimumDate : undefined}
            onValueChange={(_, value) => setDraft({ mode: draft.mode, value })}
            disabled={disabled}
            themeVariant="light"
          />
          <View style={styles.row}>
            <Button variant="secondary" size="sm" style={styles.action} disabled={disabled}
              onPress={() => setDraft(undefined)}>Annuler</Button>
            <Button size="sm" style={styles.action} disabled={disabled} onPress={confirm}>Valider</Button>
          </View>
        </View>
      )}
    </View>
  )
}

function PickerButton({ mode, value, disabled, onPress }: {
  mode: Mode; value: Date | null; disabled: boolean; onPress: () => void
}) {
  const isDate = mode === 'date'
  const text = value ? (isDate ? dateLabel : timeLabel).format(value) : 'Choisir'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${isDate ? 'Date' : 'Heure'} : ${text}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
    >
      <Text style={[styles.value, !value && styles.placeholder]}>{text}</Text>
      <Icon name={isDate ? 'calendar' : 'clock'} size={18} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  group: { gap: spacing[3] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  field: { flex: 1, minWidth: 116 },
  trigger: {
    minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: spacing[2], paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderWidth: borderWidth.regular, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.field,
  },
  pressed: { backgroundColor: colors.lavender200 },
  panel: { gap: spacing[2] },
  action: { flex: 1, minWidth: 112, paddingHorizontal: spacing[2] },
  value: { ...typography.label, flexShrink: 1, color: colors.text },
  placeholder: { color: colors.textMuted },
})
