import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native'

import { AddressField } from '@/components/onboarding/address-field'
import {
  Callout,
  EditHeader,
  EditPage,
  FormField,
  FormSection,
  Input,
  LoadStatus,
} from '@/components/ui'
import { ONBOARDING_LIMITS } from '@/data/onboarding-options'
import { saveOwnerAddress, useOwnerInfo } from '@/lib/profile-api'
import { useLeaveConfirmation } from '@/lib/use-leave-confirmation'
import { colors, typography } from '@/theme'
import type { OwnerAddressUpdate, OwnerInfo } from '@shared/profile'

type Field = 'address' | 'postalCode' | 'city'

function toForm(owner: OwnerInfo): OwnerAddressUpdate {
  return {
    address: owner.address ?? '',
    postalCode: owner.postalCode ?? '',
    city: owner.city ?? '',
    homeLocation: owner.homeLocation,
  }
}

/** Profil › Adresse : sert à calculer les distances avec les autres chiens. */
export default function AddressScreen() {
  const owner = useOwnerInfo()

  if (!owner.data) {
    return (
      <EditPage header={<Header />}>
        <LoadStatus
          error={owner.error ? 'Impossible de charger ton adresse.' : undefined}
          onRetry={owner.retry}
          loadingLabel="Chargement de ton adresse"
        />
      </EditPage>
    )
  }

  return <AddressEditor owner={owner.data} />
}

function Header(props: { onSave?: () => void; saving?: boolean }) {
  return (
    <EditHeader
      title="Adresse"
      backLabel="Retour au profil"
      onBack={() => router.back()}
      actionLabel="Enregistrer"
      onAction={props.onSave ?? (() => {})}
      loading={props.saving}
    />
  )
}

function AddressEditor({ owner }: { owner: OwnerInfo }) {
  const postalCodeRef = useRef<TextInputInstance>(null)
  const cityRef = useRef<TextInputInstance>(null)
  const [initialForm] = useState(() => toForm(owner))
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const allowLeave = useLeaveConfirmation(JSON.stringify(form) !== JSON.stringify(initialForm))

  function update(patch: Partial<OwnerAddressUpdate>) {
    setForm((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) delete next[key as Field]
      return next
    })
  }

  async function handleSave() {
    if (saving) return

    const nextErrors: Partial<Record<Field, string>> = {}
    if (!form.address.trim()) nextErrors.address = 'Renseigne ton adresse.'
    if (!/^\d{5}$/.test(form.postalCode.trim())) nextErrors.postalCode = '5 chiffres.'
    if (!form.city.trim()) nextErrors.city = 'Renseigne ta ville.'
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSaving(true)
    setSaveError('')

    try {
      await saveOwnerAddress({
        address: form.address.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
        homeLocation: form.homeLocation,
      })
      allowLeave()
      router.back()
    } catch (error) {
      console.error('Owner address save error:', error)
      setSaveError('Impossible d’enregistrer ton adresse. Vérifie ta connexion, puis réessaie.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <EditPage header={<Header onSave={handleSave} saving={saving} />}>
      {saveError ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {saveError}
        </Text>
      ) : null}

      <FormSection title="Ton adresse">
        {/* Modifier un champ à la main oublie la zone de l'adresse proposée */}
        <AddressField
          value={form.address}
          error={errors.address}
          onChangeText={(address) => update({ address, homeLocation: null })}
          onSelect={update}
          onSubmitEditing={() => postalCodeRef.current?.focus()}
        />

        <View style={styles.row}>
          <FormField label="Code postal" error={errors.postalCode} style={styles.postalCode}>
            <Input
              ref={postalCodeRef}
              placeholder="75011"
              value={form.postalCode}
              onChangeText={(postalCode) => update({ postalCode, homeLocation: null })}
              keyboardType="number-pad"
              maxLength={5}
              autoComplete="postal-code"
              textContentType="postalCode"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => cityRef.current?.focus()}
            />
          </FormField>

          <FormField label="Ville" error={errors.city} style={styles.city}>
            <Input
              ref={cityRef}
              placeholder="Paris"
              value={form.city}
              onChangeText={(city) => update({ city, homeLocation: null })}
              maxLength={ONBOARDING_LIMITS.city}
              autoComplete="postal-address-locality"
              textContentType="addressCity"
              autoCapitalize="words"
            />
          </FormField>
        </View>
      </FormSection>

      <Callout variant="info" icon="lock">
        Ton adresse reste privée. Si tu choisis une adresse proposée, sa zone approximative sert aux distances en l’absence de position GPS.
      </Callout>
    </EditPage>
  )
}

const styles = StyleSheet.create({
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  postalCode: {
    flex: 2,
    minWidth: 0,
  },
  city: {
    flex: 3,
    minWidth: 0,
  },
})
