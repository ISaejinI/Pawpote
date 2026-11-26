import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native'

import { stepProps } from '@/components/onboarding/steps'
import {
  Callout,
  DateInput,
  FormField,
  Input,
  OnboardingStepPage,
  PhotoSlot,
  PhotoSourceSheet,
} from '@/components/ui'
import { ONBOARDING_LIMITS } from '@/data/onboarding-options'
import { validateBirthDate } from '@/lib/dates'
import { useOnboardingDraft, type OwnerDraft } from '@/lib/onboarding-draft'
import { pickImage, type ImageSource } from '@/lib/pick-image'
import { colors, typography } from '@/theme'

type Field = 'birthDate' | 'address' | 'postalCode' | 'city'

/** Étape 6 · Et toi ? */
export default function OwnerStep() {
  const { owner, updateOwner } = useOnboardingDraft()
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const postalCodeRef = useRef<TextInputInstance>(null)
  const cityRef = useRef<TextInputInstance>(null)

  function update(patch: Partial<OwnerDraft>) {
    updateOwner(patch)
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) delete next[key as Field]
      return next
    })
  }

  const [sheetOpen, setSheetOpen] = useState(false)

  async function handleSelect(source: ImageSource) {
    const uri = await pickImage({ source, aspect: [1, 1] })
    if (uri) updateOwner({ photo: uri })
  }

  function handleContinue() {
    const nextErrors: Partial<Record<Field, string>> = {}
    nextErrors.birthDate = validateBirthDate(owner.birthDate, { maxAge: 120 })
    if (!owner.address.trim()) nextErrors.address = 'Renseigne ton adresse.'
    if (!/^\d{5}$/.test(owner.postalCode.trim())) nextErrors.postalCode = '5 chiffres.'
    if (!owner.city.trim()) nextErrors.city = 'Renseigne ta ville.'

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    router.push('/onboarding/preview')
  }

  return (
    <OnboardingStepPage
      {...stepProps(6)}
      title="Et toi ?"
      subtitle="Pour trouver des balades près de chez vous"
      onBack={router.back}
      onContinue={handleContinue}
    >
      <View style={styles.photoRow}>
        <PhotoSlot
          variant="avatar"
          uri={owner.photo}
          accessibilityLabel={owner.photo ? 'Changer ta photo' : 'Ajouter ta photo'}
          onPress={() => setSheetOpen(true)}
        />
        <View style={styles.photoText}>
          <Text style={styles.photoTitle}>
            Ta photo<Text style={styles.optional}> (facultatif)</Text>
          </Text>
          <Text style={styles.photoHint}>Pour que les autres maîtres te reconnaissent au parc</Text>
        </View>
      </View>

      <FormField label="Ta date de naissance" error={errors.birthDate}>
        <DateInput value={owner.birthDate} onChangeText={(birthDate) => update({ birthDate })} />
      </FormField>

      <FormField label="Adresse" error={errors.address}>
        <Input
          placeholder="N° et nom de rue"
          value={owner.address}
          onChangeText={(address) => update({ address })}
          maxLength={ONBOARDING_LIMITS.address}
          autoComplete="street-address"
          textContentType="streetAddressLine1"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => postalCodeRef.current?.focus()}
        />
      </FormField>

      <View style={styles.row}>
        <FormField label="Code postal" error={errors.postalCode} style={styles.postalCode}>
          <Input
            ref={postalCodeRef}
            placeholder="75011"
            value={owner.postalCode}
            onChangeText={(postalCode) => update({ postalCode })}
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
            value={owner.city}
            onChangeText={(city) => update({ city })}
            maxLength={ONBOARDING_LIMITS.city}
            autoComplete="postal-address-locality"
            textContentType="addressCity"
            autoCapitalize="words"
          />
        </FormField>
      </View>

      <Callout variant="info" icon="lock">
        Ton adresse n’est jamais affichée. Elle sert seulement à calculer les distances avec les autres chiens.
      </Callout>

      <PhotoSourceSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={handleSelect}
        onDelete={owner.photo ? () => updateOwner({ photo: null }) : undefined}
        title={owner.photo ? 'Changer ta photo' : 'Ajouter ta photo'}
        subtitle="Pour que les autres maîtres te reconnaissent"
      />
    </OnboardingStepPage>
  )
}

const styles = StyleSheet.create({
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  photoText: {
    flex: 1,
    gap: 2,
  },
  photoTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  optional: {
    fontWeight: 500,
    color: colors.textMuted,
  },
  photoHint: {
    ...typography.label,
    fontWeight: 500,
    color: colors.text,
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
