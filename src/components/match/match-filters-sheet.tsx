import Slider from '@react-native-community/slider'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { BottomSheet, Button, Chip, Icon, SegmentedControl } from '@/components/ui'
import { getMatchPosition } from '@/lib/match-location'
import { borderWidth, colors, radius, spacing, typography } from '@/theme'
import {
  DEFAULT_DISCOVERY_FILTERS, DOG_AGES, DOG_SIZES,
  MAX_DISCOVERY_RADIUS_KM, MIN_DISCOVERY_RADIUS_KM,
  type Coordinates, type DiscoveryFilters, type DogAge, type DogSize,
} from '@shared/discovery'

const DEFAULT_RADIUS_KM = 5
const SIZE_LABELS: Record<DogSize, string> = { small: 'Petit', medium: 'Moyen', large: 'Grand' }
const AGE_LABELS: Record<DogAge, string> = {
  puppy: 'Chiot (−1 an)',
  young: 'Jeune (1 à 2 ans)',
  adult: 'Adulte (3 à 7 ans)',
  senior: 'Senior (8 ans et +)',
}
const SEX_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'female', label: 'Femelle' },
  { value: 'male', label: 'Mâle' },
] as const

type PositionState =
  | { status: 'off' | 'locating' }
  | { status: 'ready'; coordinates: Coordinates }
  | { status: 'error'; message: string }

type Props = {
  visible: boolean
  initialFilters: DiscoveryFilters
  onClose: () => void
  onApply: (filters: DiscoveryFilters, position?: Coordinates) => Promise<void>
}

function toggleChoice<T>(choices: T[], choice: T) {
  return choices.includes(choice) ? choices.filter((item) => item !== choice) : [...choices, choice]
}

async function locate(): Promise<PositionState> {
  try {
    return { status: 'ready', coordinates: await getMatchPosition() }
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Position indisponible.' }
  }
}

export function MatchFiltersSheet({ visible, initialFilters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState(initialFilters)
  const [position, setPosition] = useState<PositionState>(
    { status: initialFilters.nearby ? 'locating' : 'off' },
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const nearby = position.status === 'ready'
  const locating = position.status === 'locating'
  const busy = locating || saving
  const radiusKm = draft.radiusKm ?? DEFAULT_RADIUS_KM

  useEffect(() => {
    if (!initialFilters.nearby) return
    let active = true
    void locate().then((result) => { if (active) setPosition(result) })
    return () => { active = false }
  }, [initialFilters.nearby])

  async function togglePosition() {
    if (nearby) {
      setPosition({ status: 'off' })
    } else {
      setPosition({ status: 'locating' })
      setPosition(await locate())
    }
  }

  function reset() {
    setDraft(DEFAULT_DISCOVERY_FILTERS)
    setPosition({ status: 'off' })
    setSaveError(false)
  }

  async function apply() {
    setSaving(true)
    setSaveError(false)
    try {
      await onApply(
        { ...draft, nearby, radiusKm: nearby ? radiusKm : undefined },
        position.status === 'ready' ? position.coordinates : undefined,
      )
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={() => { if (!saving) onClose() }}
      title="Filtres"
      subtitle="Trouve le copain de balade idéal"
      footer={(
        <View style={styles.section}>
          {saveError && (
            <Text accessibilityRole="alert" style={styles.error}>Impossible d’appliquer les filtres. Réessaie.</Text>
          )}
          <View style={styles.footer}>
            <Button size="md" variant="secondary" disabled={busy} onPress={reset}>Réinitialiser</Button>
            <Button style={styles.applyButton} size="md" disabled={busy} loading={saving}
              onPress={() => { void apply() }}>
              Appliquer
            </Button>
          </View>
        </View>
      )}
    >
      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">Position</Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: nearby || locating, disabled: busy, busy: locating }}
            disabled={busy}
            style={styles.position}
            onPress={() => { void togglePosition() }}
          >
            <Icon name="pin" size={20} />
            <Text style={[styles.heading, styles.positionLabel]}>
              {locating ? 'Recherche de ta position…' : 'Utiliser ma position actuelle'}
            </Text>
            <View style={[styles.switchTrack, (nearby || locating) && styles.switchOn]}>
              <View style={styles.switchKnob} />
            </View>
          </Pressable>
          <Text style={styles.hint}>
            Ta position est enregistrée sur ton profil pour calculer les distances.
          </Text>
          {position.status === 'error' && (
            <Text accessibilityRole="alert" style={styles.error}>{position.message}</Text>
          )}
        </View>

        <View style={[styles.section, !nearby && styles.disabledSection]}>
          <View style={styles.sectionHeading}>
            <Text style={styles.heading} accessibilityRole="header">Distance de recherche</Text>
            <Text style={styles.distance}>{radiusKm} km</Text>
          </View>
          <Slider
            accessibilityLabel="Distance de recherche en kilomètres"
            minimumValue={MIN_DISCOVERY_RADIUS_KM}
            maximumValue={MAX_DISCOVERY_RADIUS_KM}
            value={radiusKm}
            step={1}
            disabled={!nearby || busy}
            onValueChange={(next) => setDraft((current) => ({ ...current, radiusKm: next }))}
            minimumTrackTintColor={colors.lime500}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.active}
            style={styles.slider}
          />
          <View style={styles.sectionHeading}>
            <Text style={styles.hint}>{MIN_DISCOVERY_RADIUS_KM} km</Text>
            <Text style={styles.hint}>{MAX_DISCOVERY_RADIUS_KM} km</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.heading} accessibilityRole="header">Gabarit</Text>
            <Text style={styles.hint}>Plusieurs choix possibles</Text>
          </View>
          <View style={styles.sizeRow}>
            {DOG_SIZES.map((size, index) => {
              const selected = draft.sizes.includes(size)
              return (
                <Pressable
                  key={size}
                  accessibilityRole="togglebutton"
                  accessibilityState={{ checked: selected }}
                  disabled={saving}
                  onPress={() => setDraft((current) => ({ ...current, sizes: toggleChoice(current.sizes, size) }))}
                  style={[styles.sizeTile, selected && styles.sizeSelected]}
                >
                  <Icon name="paw" size={18 + index * 4} />
                  <Text style={styles.heading}>{SIZE_LABELS[size]}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">Âge</Text>
          <View style={styles.ageRow}>
            {DOG_AGES.map((age) => (
              <Chip
                key={age}
                label={AGE_LABELS[age]}
                selected={draft.ages.includes(age)}
                color="pink"
                disabled={saving}
                onPress={() => setDraft((current) => ({ ...current, ages: toggleChoice(current.ages, age) }))}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">Sexe</Text>
          <SegmentedControl
            options={[...SEX_OPTIONS]}
            value={draft.sex ?? 'all'}
            onChange={(sex) => {
              if (!saving) setDraft((current) => ({ ...current, sex: sex === 'all' ? null : sex }))
            }}
            accessibilityLabel="Sexe du chien"
          />
        </View>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  body: { gap: spacing[4], paddingBottom: spacing[2] },
  section: { gap: spacing[2] },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2] },
  heading: { ...typography.bodyStrong, color: colors.text },
  hint: { ...typography.small, color: colors.textMuted },
  error: { ...typography.small, color: colors.danger },
  position: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2], padding: spacing[2], minHeight: 50,
    paddingLeft: spacing[3], borderWidth: borderWidth.thin, borderRadius: radius.pill,
    borderColor: colors.border, backgroundColor: colors.field,
  },
  positionLabel: { flex: 1 },
  switchTrack: {
    flexDirection: 'row', alignItems: 'center', width: 50, height: 30, paddingHorizontal: 3,
    borderWidth: borderWidth.thin, borderColor: colors.border, borderRadius: radius.pill,
    backgroundColor: colors.lavender200,
  },
  switchOn: { justifyContent: 'flex-end', backgroundColor: colors.lime500 },
  switchKnob: {
    width: 21, height: 21, borderWidth: borderWidth.thin, borderColor: colors.border,
    borderRadius: radius.pill, backgroundColor: colors.field,
  },
  disabledSection: { opacity: 0.5 },
  distance: { ...typography.titleLg, fontSize: 22, lineHeight: 26, color: colors.text },
  slider: { height: 32, width: '100%' },
  sizeRow: { flexDirection: 'row', gap: spacing[2], paddingRight: 4, paddingBottom: 4 },
  sizeTile: {
    flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: spacing[1],
    borderWidth: borderWidth.thin, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.field,
  },
  sizeSelected: { backgroundColor: colors.active, boxShadow: `3px 3px 0 ${colors.border}` },
  ageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  footer: { flexDirection: 'row', gap: spacing[2], paddingRight: 4, paddingBottom: 4 },
  applyButton: { flex: 1, paddingHorizontal: spacing[2] },
})
