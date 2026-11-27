import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, View, type TextInputInstance } from 'react-native'

import { AddressField } from '@/features/onboarding/components/address-field'
import { stepProps } from '@/features/onboarding/steps'
import {
  AvatarField,
  Callout,
  DateInput,
  FormField,
  Input,
  OnboardingStepPage,
  PhotoSourceSheet,
} from '@/components/ui'
import { ONBOARDING_LIMITS } from '@/features/onboarding/options'
import { validateBirthDate } from '@/lib/dates'
import { useOnboardingDraft, type OwnerDraft } from '@/features/onboarding/onboarding-draft'
import { pickImage, type ImageSource } from '@/lib/pick-image'

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
      <AvatarField uri={owner.photo} onPress={() => setSheetOpen(true)} />

      <FormField label="Ta date de naissance" error={errors.birthDate}>
        <DateInput value={owner.birthDate} onChangeText={(birthDate) => update({ birthDate })} />
      </FormField>

      <AddressField
        value={owner.address}
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
            value={owner.postalCode}
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
            value={owner.city}
            onChangeText={(city) => update({ city, homeLocation: null })}
            maxLength={ONBOARDING_LIMITS.city}
            autoComplete="postal-address-locality"
            textContentType="addressCity"
            autoCapitalize="words"
          />
        </FormField>
      </View>

      <Callout variant="info" icon="lock">
        Ton adresse reste privée. Si tu choisis une adresse proposée, sa zone approximative sert aux distances en l’absence de position GPS.
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
