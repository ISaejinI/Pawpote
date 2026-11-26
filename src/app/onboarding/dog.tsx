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
  TextLink,
} from '@/components/ui'
import { ONBOARDING_LIMITS } from '@/data/onboarding-options'
import { useBreedCatalog } from '@/lib/breed-catalog'
import { validateBirthDate } from '@/lib/dates'
import { useOnboardingDraft, type DogDraft, type DogSex } from '@/lib/onboarding-draft'

const SEX_OPTIONS = [
  { value: 'female', label: 'Femelle' },
  { value: 'male', label: 'Mâle' },
] as const satisfies { value: DogSex; label: string }[]

const OTHER_BREEDS = ['Croisé', 'Autre race']

type Field = 'name' | 'sex' | 'birthDate' | 'breed'

/** Étape 1 · Ton chien */
export default function DogStep() {
  const { dog, updateDog } = useOnboardingDraft()
  const { catalog, retry } = useBreedCatalog()
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const breeds = catalog.status === 'ready' ? catalog.breeds : []

  function update(patch: Partial<DogDraft>) {
    updateDog(patch)
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) delete next[key as Field]
      return next
    })
  }

  function chooseBreed(name: string) {
    const id = breeds.find((breed) => breed.name === name)?.id ?? null
    update({ breed: { id, name } })
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
          maxLength={ONBOARDING_LIMITS.dogName}
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
          options={[...OTHER_BREEDS, ...breeds.map((breed) => breed.name)]}
          value={dog.breed?.name ?? null}
          onChange={chooseBreed}
          disabled={catalog.status !== 'ready'}
          placeholder={catalog.status === 'loading' ? 'Chargement des races…' : 'Choisis une race'}
          searchPlaceholder="Rechercher une race…"
          emptyMessage="Aucune race trouvée. Recherche « Autre race »."
        />
        {catalog.status === 'error' && (
          <TextLink onPress={retry}>Liste indisponible. Réessayer</TextLink>
        )}
      </FormField>
    </OnboardingStepPage>
  )
}
