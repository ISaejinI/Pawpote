import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native'

import {
  AvatarField,
  DateInput,
  EditHeader,
  EditPage,
  FormField,
  FormSection,
  Input,
  LoadStatus,
  PhotoSourceSheet,
} from '@/components/ui'
import { dateInputToIso, isoToDateInput, validateBirthDate } from '@/lib/dates'
import { uploadPhoto } from '@/features/onboarding/api'
import { pickImage, type ImageSource } from '@/lib/pick-image'
import { saveOwnerIdentity, useOwnerInfo } from '@/features/profile/api'
import { useLeaveConfirmation } from '@/lib/use-leave-confirmation'
import { colors, typography } from '@/theme'
import { NAME_MAX_LENGTH, type OwnerInfo } from '@shared/profile'

type IdentityForm = {
  firstName: string
  lastName: string
  /** « JJ / MM / AAAA » */
  birthDate: string
  /** URL de la photo enregistrée, URI locale d'une nouvelle photo, ou `null`. */
  photo: string | null
}

type Field = 'firstName' | 'lastName' | 'birthDate'

function toForm(owner: OwnerInfo): IdentityForm {
  return {
    firstName: owner.firstName,
    lastName: owner.lastName ?? '',
    birthDate: isoToDateInput(owner.birthDate),
    photo: owner.photo,
  }
}

/** Profil › Infos personnelles : prénom, nom, date de naissance et photo. */
export default function IdentityScreen() {
  const owner = useOwnerInfo()

  if (!owner.data) {
    return (
      <EditPage header={<Header />}>
        <LoadStatus
          error={owner.error ? 'Impossible de charger tes informations.' : undefined}
          onRetry={owner.retry}
          loadingLabel="Chargement de tes informations"
        />
      </EditPage>
    )
  }

  return <IdentityEditor owner={owner.data} />
}

function Header(props: { onSave?: () => void; saving?: boolean }) {
  return (
    <EditHeader
      title="Infos perso"
      backLabel="Retour au profil"
      onBack={() => router.back()}
      actionLabel="Enregistrer"
      onAction={props.onSave ?? (() => {})}
      loading={props.saving}
    />
  )
}

function IdentityEditor({ owner }: { owner: OwnerInfo }) {
  const lastNameRef = useRef<TextInputInstance>(null)
  const [initialForm] = useState(() => toForm(owner))
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false)
  // Photo déjà envoyée (URI locale → clé) : un nouvel essai ne la renvoie pas
  const uploadedPhotos = useRef(new Map<string, string>())

  const allowLeave = useLeaveConfirmation(JSON.stringify(form) !== JSON.stringify(initialForm))

  function update(patch: Partial<IdentityForm>) {
    setForm((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of Object.keys(patch)) delete next[key as Field]
      return next
    })
  }

  async function handlePhotoSource(source: ImageSource) {
    const uri = await pickImage({ source, aspect: [1, 1] })
    if (uri) update({ photo: uri })
  }

  async function handleSave() {
    if (saving) return

    const nextErrors: Partial<Record<Field, string>> = {}
    if (!form.firstName.trim()) nextErrors.firstName = 'Renseigne ton prénom.'
    if (!form.lastName.trim()) nextErrors.lastName = 'Renseigne ton nom.'
    nextErrors.birthDate = validateBirthDate(form.birthDate, { maxAge: 120 })
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSaving(true)
    setSaveError('')

    try {
      // Une nouvelle photo part d'abord vers le stockage ; la photo actuelle reste une URL
      let photo = form.photo
      if (photo && !photo.startsWith('https://')) {
        const uri = photo
        photo = uploadedPhotos.current.get(uri) ?? (await uploadPhoto(uri))
        uploadedPhotos.current.set(uri, photo)
      }

      await saveOwnerIdentity({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthDate: dateInputToIso(form.birthDate)!,
        photo,
      })

      allowLeave()
      router.back()
    } catch (error) {
      console.error('Owner identity save error:', error)
      setSaveError('Impossible d’enregistrer tes informations. Vérifie ta connexion, puis réessaie.')
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

      <FormSection title="Toi">
        <AvatarField uri={form.photo} onPress={() => setPhotoSheetOpen(true)} />

        <View style={styles.row}>
          <FormField label="Prénom" error={errors.firstName} style={styles.half}>
            <Input
              value={form.firstName}
              onChangeText={(firstName) => update({ firstName })}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="given-name"
              textContentType="givenName"
              autoCapitalize="words"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
          </FormField>

          <FormField label="Nom" error={errors.lastName} style={styles.half}>
            <Input
              ref={lastNameRef}
              value={form.lastName}
              onChangeText={(lastName) => update({ lastName })}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="family-name"
              textContentType="familyName"
              autoCapitalize="words"
            />
          </FormField>
        </View>

        <FormField label="Ta date de naissance" error={errors.birthDate}>
          <DateInput value={form.birthDate} onChangeText={(birthDate) => update({ birthDate })} />
        </FormField>
      </FormSection>

      <PhotoSourceSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        onSelect={handlePhotoSource}
        onDelete={form.photo ? () => update({ photo: null }) : undefined}
        title={form.photo ? 'Changer ta photo' : 'Ajouter ta photo'}
        subtitle="Pour que les autres maîtres te reconnaissent"
      />
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
  half: {
    flex: 1,
    minWidth: 0,
  },
})
