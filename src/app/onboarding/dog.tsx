import { router } from 'expo-router'
import { useState } from 'react'

import { stepProps } from '@/components/onboarding/steps'
import {
  ChoiceGroup,
  DateInput,
  FormField,
  Input,
  OnboardingStepPage,
  Select,
} from '@/components/ui'
import { BREEDS } from '@/data/onboarding-options'
import { validateBirthDate } from '@/lib/dates'
import { useOnboardingDraft, type DogDraft, type DogSex } from '@/lib/onboarding-draft'

const SEX_OPTIONS = [
  { value: 'female', label: 'Femelle' },
  { value: 'male', label: 'Mâle' },
] as const satisfies { value: DogSex; label: string }[]

type Field = 'name' | 'sex' | 'birthDate' | 'breed'

/** Étape 1 · Ton chien */
export default function DogStep() {
  const { dog, updateDog } = useOnboardingDraft()
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})

  function update(patch: Partial<DogDraft>) {
    updateDog(patch)
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) delete next[key as Field]
      return next
    })
  }

  function handleContinue() {
    const nextErrors: Partial<Record<Field, string>> = {}
    if (!dog.name.trim()) nextErrors.name = 'Indique le nom de ton chien.'
    if (!dog.sex) nextErrors.sex = 'Choisis son sexe.'
    nextErrors.birthDate = validateBirthDate(dog.birthDate, { maxAge: 30 })
    if (!dog.breed) nextErrors.breed = 'Choisis sa race.'

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    router.push('/onboarding/photo')
  }

  return (
    <OnboardingStepPage
      {...stepProps(1)}
      title="Présente-nous ton chien"
      subtitle="On commence par l’essentiel"
      onContinue={handleContinue}
    >
      <FormField label="Son nom" error={errors.name}>
        <Input
          placeholder="Ex. Biscotte"
          value={dog.name}
          onChangeText={(name) => update({ name })}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </FormField>

      <FormField label="Sexe" error={errors.sex}>
        <ChoiceGroup options={SEX_OPTIONS} value={dog.sex} onChange={(sex) => update({ sex })} />
      </FormField>

      <FormField label="Date de naissance" error={errors.birthDate}>
        <DateInput value={dog.birthDate} onChangeText={(birthDate) => update({ birthDate })} />
      </FormField>

      <FormField label="Race" error={errors.breed}>
        <Select
          options={BREEDS}
          value={dog.breed}
          onChange={(breed) => update({ breed })}
          placeholder="Choisis une race"
          searchPlaceholder="Rechercher une race…"
          emptyMessage="Aucune race trouvée. Choisis « Autre race »."
        />
      </FormField>
    </OnboardingStepPage>
  )
}
