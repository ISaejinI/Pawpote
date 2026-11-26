import { useEffect, useState } from 'react'
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native'

import { FormField, Icon, Input } from '@/components/ui'
import { ONBOARDING_LIMITS } from '@/data/onboarding-options'
import { addressSuggestionKey, searchAddresses, type AddressSuggestion } from '@/lib/address-suggestions'
import { borderWidth, colors, radius, spacing, typography } from '@/theme'

const MIN_QUERY_LENGTH = 3
const SEARCH_DELAY_MS = 300
const SEARCH_TIMEOUT_MS = 8_000

type Result = { query: string } & (
  | { status: 'ready'; suggestions: AddressSuggestion[] }
  | { status: 'error' }
)

type AddressFieldProps = {
  value: string
  error?: string
  onChangeText: (value: string) => void
  onSelect: (address: AddressSuggestion) => void
  onSubmitEditing: () => void
}

export function AddressField({ value, error, onChangeText, onSelect, onSubmitEditing }: AddressFieldProps) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<Result>()
  const current = result?.query === query ? result : undefined
  const searchActive = query.length >= MIN_QUERY_LENGTH
  const suggestions = current?.status === 'ready' ? current.suggestions : []

  useEffect(() => {
    if (!searchActive) return

    const controller = new AbortController()
    let timeout: ReturnType<typeof setTimeout> | undefined
    const debounce = setTimeout(() => {
      timeout = setTimeout(() => {
        controller.abort()
        setResult({ query, status: 'error' })
      }, SEARCH_TIMEOUT_MS)

      void searchAddresses(query, controller.signal)
        .then((addresses) => {
          if (!controller.signal.aborted) setResult({ query, status: 'ready', suggestions: addresses })
        }, () => {
          if (!controller.signal.aborted) setResult({ query, status: 'error' })
        })
        .finally(() => clearTimeout(timeout))
    }, SEARCH_DELAY_MS)

    return () => {
      clearTimeout(debounce)
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query, searchActive])

  function select(suggestion: AddressSuggestion) {
    setQuery('')
    onSelect(suggestion)
    Keyboard.dismiss()
  }

  const message = !searchActive
    ? undefined
    : !current
      ? 'Recherche d’adresses…'
      : current.status === 'error'
        ? 'Suggestions indisponibles. Tu peux compléter ton adresse à la main.'
        : suggestions.length === 0
          ? 'Aucune adresse trouvée. Essaie d’ajouter le numéro ou la ville.'
          : undefined

  return (
    <FormField label="Adresse" error={error}>
      <Input
        placeholder="N° et nom de rue"
        value={value}
        onChangeText={(text) => {
          onChangeText(text)
          setQuery(text.trim())
        }}
        maxLength={ONBOARDING_LIMITS.address}
        autoComplete="street-address"
        textContentType="streetAddressLine1"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => {
          setQuery('')
          onSubmitEditing()
        }}
      />

      {message && <Text accessibilityLiveRegion="polite" style={styles.hint}>{message}</Text>}
      {suggestions.length > 0 && (
        <View style={styles.list}>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={addressSuggestionKey(suggestion)}
              accessibilityRole="button"
              accessibilityLabel={`${suggestion.address}, ${suggestion.postalCode} ${suggestion.city}`}
              onPress={() => select(suggestion)}
              style={({ pressed }) => [
                styles.option,
                index > 0 && styles.separator,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="pin" size={18} />
              <View style={styles.optionText}>
                <Text style={styles.address}>{suggestion.address}</Text>
                <Text style={styles.hint}>{suggestion.postalCode} {suggestion.city}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </FormField>
  )
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.field,
    borderColor: colors.border,
    borderWidth: borderWidth.thin,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  option: {
    minHeight: 48,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  optionText: { flex: 1 },
  separator: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  pressed: { backgroundColor: colors.lavender200 },
  address: { ...typography.label, color: colors.text },
  hint: { ...typography.small, color: colors.textMuted },
})
