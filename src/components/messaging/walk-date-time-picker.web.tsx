import type { CSSProperties } from 'react'
import { StyleSheet, View } from 'react-native'

import { FormField } from '@/components/ui'
import { borderWidth, colors, radius, spacing, typography } from '@/theme'
import type { WalkDateTimePickerProps } from './walk-date-time-picker'

const pad = (value: number) => String(value).padStart(2, '0')

function localDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function WalkDateTimePicker({ date, time, minimumDate, disabled, onDate, onTime }: WalkDateTimePickerProps) {
  return (
    <View style={styles.row}>
      <FormField label="Date" style={styles.field}>
        <input
          type="date"
          aria-label="Date du rendez-vous"
          value={date ? localDate(date) : ''}
          min={localDate(minimumDate)}
          disabled={disabled}
          style={inputStyle}
          onChange={({ currentTarget: { value } }) => {
            const [year, month, day] = value.split('-').map(Number)
            onDate(value ? new Date(year, month - 1, day) : null)
          }}
        />
      </FormField>
      <FormField label="Heure" style={styles.field}>
        <input
          type="time"
          aria-label="Heure du rendez-vous"
          value={time ? `${pad(time.getHours())}:${pad(time.getMinutes())}` : ''}
          disabled={disabled}
          style={inputStyle}
          onChange={({ currentTarget: { value } }) => {
            const [hours, minutes] = value.split(':').map(Number)
            onTime(value ? new Date(2000, 0, 1, hours, minutes) : null)
          }}
        />
      </FormField>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  field: { flex: 1, minWidth: 116 },
})

const inputStyle: CSSProperties = {
  boxSizing: 'border-box', width: '100%', minWidth: 0, minHeight: 50, paddingInline: spacing[2],
  border: `${borderWidth.regular}px solid ${colors.border}`, borderRadius: radius.md,
  backgroundColor: colors.field, color: colors.text,
  fontFamily: typography.label.fontFamily, fontSize: typography.label.fontSize,
}
