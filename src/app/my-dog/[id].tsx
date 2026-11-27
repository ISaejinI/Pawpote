import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'

import {
  BottomSheet,
  Button,
  Chip,
  ChoiceGroup,
  CompletionCard,
  DateInput,
  DogPhotosEditor,
  EditHeader,
  EditPage,
  FormField,
  FormSection,
  Input,
  MatchCard,
  PhotoSourceSheet,
  Select,
  TextArea,
  TextLink,
  type DogPhotoTarget,
  type EditPageScrollRef,
} from '@/components/ui'
import { ACTIVITIES, ONBOARDING_LIMITS, TRAITS } from '@/features/onboarding/options'
import { useBreedCatalog } from '@/features/onboarding/breed-catalog'
import { ageInYears, dateInputToIso, isoToDateInput, parseDateInput, validateBirthDate } from '@/lib/dates'
import { uploadPhoto } from '@/features/onboarding/api'
import { useOnboardingStatus } from '@/features/onboarding/onboarding-status'
import { toggleValue } from '@/features/onboarding/onboarding-draft'
import { pickImage, type ImageSource } from '@/lib/pick-image'
import { getDogSheet, removeDog, saveDogSheet } from '@/features/profile/api'
import { useLeaveConfirmation } from '@/lib/use-leave-confirmation'
import { colors, spacing, typography } from '@/theme'
import {
  COMPLETION_LABELS, dogCompletion, type CompletionItem, type DogSheet,
} from '@shared/profile'

type Sex = 'female' | 'male'

const SEX_OPTIONS = [
  { value: 'female', label: 'Femelle' },
  { value: 'male', label: 'Mâle' },
] as const satisfies { value: Sex; label: string }[]

const OTHER_BREEDS = ['Croisé', 'Autre race']

/** La fiche en cours de modification. */
type DogForm = {
  name: string
  sex: Sex | null
  /** « JJ / MM / AAAA » */
  birthDate: string
  breed: { id: number | null; name: string } | null
  traits: string[]
  quirk: string
  favoriteToy: string
  activities: string[]
  description: string
  mainPhoto: string | null
  extraPhotos: (string | null)[]
}

type Section = 'photos' | 'identity' | 'character' | 'likes'

/** Section où se trouve chaque élément de la complétion. */
const SECTION_OF: Record<CompletionItem, Section> = {
  photo: 'photos',
  sex: 'identity',
  birthDate: 'identity',
  breed: 'identity',
  traits: 'character',
  quirk: 'character',
  favoriteToy: 'character',
  activities: 'likes',
  description: 'likes',
}

function toForm(sheet: DogSheet): DogForm {
  const [mainPhoto = null, ...extras] = sheet.photos
  return {
    name: sheet.name,
    sex: sheet.sex,
    birthDate: isoToDateInput(sheet.birthDate),
    breed: sheet.breed,
    traits: sheet.traits,
    quirk: sheet.quirk ?? '',
    favoriteToy: sheet.favoriteToy ?? '',
    activities: sheet.activities,
    description: sheet.description ?? '',
    mainPhoto,
    extraPhotos: [0, 1, 2].map((index) => extras[index] ?? null),
  }
}

/** Photos dans l'ordre, la principale en premier, sans les emplacements vides. */
function orderedPhotos(form: DogForm) {
  return [form.mainPhoto, ...form.extraPhotos].filter((uri): uri is string => !!uri)
}

/** Profil › fiche d'un de mes chiens, à modifier ou compléter. */
export default function MyDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const scrollRef = useRef<EditPageScrollRef>(null)
  const sectionY = useRef<Partial<Record<Section, number>>>({})

  const [sheet, setSheet] = useState<DogSheet>()
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [form, setForm] = useState<DogForm>()
  const [initialForm, setInitialForm] = useState<DogForm>()

  const [errors, setErrors] = useState<Partial<Record<'name' | 'sex' | 'birthDate', string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [removing, setRemoving] = useState(false)

  // La cible reste en mémoire pendant l'animation de fermeture de la modale
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false)
  const [photoTarget, setPhotoTarget] = useState<DogPhotoTarget>('main')
  const [previewOpen, setPreviewOpen] = useState(false)

  const { catalog, retry: retryBreeds } = useBreedCatalog()
  const { restartOnboarding } = useOnboardingStatus()
  const breeds = catalog.status === 'ready' ? catalog.breeds : []

  // Photos déjà envoyées (URI locale → clé) : un nouvel essai ne les renvoie pas
  const uploadedPhotos = useRef(new Map<string, string>())

  useEffect(() => {
    const controller = new AbortController()
    getDogSheet(id, controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return
        setSheet(result)
        setForm(toForm(result))
        setInitialForm(toForm(result))
      },
      () => {
        if (!controller.signal.aborted) setLoadError(true)
      },
    )
    return () => controller.abort()
  }, [id, attempt])

  const dirty = !!form && JSON.stringify(form) !== JSON.stringify(initialForm)

  // Retour (bouton, geste ou retour Android) avec des modifications non enregistrées : on demande
  const allowLeave = useLeaveConfirmation(dirty)

  if (!form || !sheet) {
    return (
      <EditPage
        header={<EditHeader title="" onBack={() => router.back()} actionLabel="Enregistrer" onAction={() => {}} />}
      >
        <View style={styles.pending}>
          {loadError ? (
            <>
              <Text style={styles.error} accessibilityRole="alert">
                Impossible de charger cette fiche.
              </Text>
              <TextLink
                onPress={() => {
                  setLoadError(false)
                  setAttempt((current) => current + 1)
                }}
              >
                Réessayer
              </TextLink>
            </>
          ) : (
            <ActivityIndicator color={colors.text} accessibilityLabel="Chargement de la fiche" />
          )}
        </View>
      </EditPage>
    )
  }

  const current = form
  const dogName = current.name.trim() || sheet.name
  const completion = dogCompletion({
    hasPhoto: orderedPhotos(current).length > 0,
    hasBreed: !!current.breed?.id,
    hasBirthDate: !!parseDateInput(current.birthDate),
    hasSex: !!current.sex,
    traitCount: current.traits.length,
    quirk: current.quirk,
    favoriteToy: current.favoriteToy,
    activityCount: current.activities.length,
    description: current.description,
  })

  function update(patch: Partial<DogForm>) {
    setForm((previous) => (previous ? { ...previous, ...patch } : previous))
    setErrors((previous) => {
      const next = { ...previous }
      for (const key of Object.keys(patch)) delete next[key as keyof typeof next]
      return next
    })
  }

  function scrollTo(section: Section) {
    const y = sectionY.current[section]
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing[3]), animated: true })
  }


  // ---- Photos ----------------------------------------------------------------

  const targetUri = photoTarget === 'main' ? current.mainPhoto : current.extraPhotos[photoTarget]

  function openPhotoSheet(target: DogPhotoTarget) {
    setPhotoTarget(target)
    setPhotoSheetOpen(true)
  }

  function setTargetPhoto(uri: string | null) {
    if (photoTarget === 'main') update({ mainPhoto: uri })
    else update({ extraPhotos: current.extraPhotos.map((photo, i) => (i === photoTarget ? uri : photo)) })
  }

  async function handlePhotoSource(source: ImageSource) {
    const uri = await pickImage({ source, aspect: photoTarget === 'main' ? [3, 4] : [1, 1] })
    if (uri) setTargetPhoto(uri)
  }

  // ---- Enregistrement ----------------------------------------------------------

  function chooseBreed(name: string) {
    const breedId = breeds.find((breed) => breed.name === name)?.id ?? null
    update({ breed: { id: breedId, name } })
  }

  async function handleSave() {
    if (saving) return

    const nextErrors: typeof errors = {}
    if (!current.name.trim()) nextErrors.name = 'Indique le nom de ton chien.'
    if (!current.sex) nextErrors.sex = 'Choisis son sexe.'
    nextErrors.birthDate = validateBirthDate(current.birthDate, { maxAge: 30 })
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      scrollTo('identity')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      // Les nouvelles photos partent d'abord vers le stockage ; les autres sont déjà des URL
      const photos = await Promise.all(
        orderedPhotos(current).map(async (uri) => {
          if (uri.startsWith('https://')) return uri
          const known = uploadedPhotos.current.get(uri)
          if (known) return known
          const key = await uploadPhoto(uri)
          uploadedPhotos.current.set(uri, key)
          return key
        }),
      )

      await saveDogSheet(sheet!.id, {
        name: current.name.trim(),
        sex: current.sex!,
        birthDate: dateInputToIso(current.birthDate)!,
        breedId: current.breed?.id ?? null,
        traits: current.traits,
        quirk: current.quirk.trim() || null,
        favoriteToy: current.favoriteToy.trim() || null,
        activities: current.activities,
        description: current.description.trim() || null,
        photos,
      })

      // Plus rien à perdre : le retour ne demande pas de confirmation
      allowLeave()
      router.back()
    } catch (error) {
      console.error('Dog sheet save error:', error)
      setSaveError('Impossible d’enregistrer la fiche. Vérifie ta connexion, puis réessaie.')
    } finally {
      setSaving(false)
    }
  }

  function handleRemove() {
    const consequences = sheet!.isLastDog
      ? 'C’est ton seul chien : tu devras en présenter un nouveau pour continuer à utiliser PawPote.'
      : 'Cette action est définitive.'

    Alert.alert(
      `Retirer ${sheet!.name} ?`,
      `Sa fiche, ses photos et ses matchs seront supprimés. ${consequences}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true)
            try {
              const { remainingDogs } = await removeDog(sheet!.id)
              allowLeave()
              // Plus aucun chien : la garde du layout racine bascule vers l'onboarding
              if (remainingDogs === 0) restartOnboarding()
              else router.back()
            } catch (error) {
              console.error('Dog removal error:', error)
              setRemoving(false)
              Alert.alert('Impossible de retirer ce chien', 'Vérifie ta connexion, puis réessaie.')
            }
          },
        },
      ],
    )
  }

  const birthDate = parseDateInput(current.birthDate)

  return (
    <EditPage
      scrollRef={scrollRef}
      header={
        <EditHeader
          title={dogName}
          backLabel="Retour au profil"
          onBack={() => router.back()}
          actionLabel="Enregistrer"
          onAction={handleSave}
          loading={saving}
        />
      }
    >
      {saveError ? (
        <Text style={styles.saveError} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {saveError}
        </Text>
      ) : null}

      <DogPhotosEditor
        dogName={dogName}
        mainPhoto={current.mainPhoto}
        extraPhotos={current.extraPhotos}
        onPressPhoto={openPhotoSheet}
        onPreview={() => setPreviewOpen(true)}
        onLayout={({ nativeEvent }) => (sectionY.current.photos = nativeEvent.layout.y)}
      />

      <CompletionCard
        dogName={dogName}
        value={completion.value}
        missing={completion.missing.map((key) => ({ key, label: COMPLETION_LABELS[key] }))}
        onPressMissing={(key) => scrollTo(SECTION_OF[key])}
      />

      <FormSection title="Identité" onLayout={({ nativeEvent }) => (sectionY.current.identity = nativeEvent.layout.y)}>
        <FormField label="Nom" error={errors.name}>
          <Input
            value={current.name}
            onChangeText={(name) => update({ name })}
            maxLength={ONBOARDING_LIMITS.dogName}
            autoCapitalize="words"
          />
        </FormField>

        <FormField label="Sexe" error={errors.sex}>
          <ChoiceGroup options={SEX_OPTIONS} value={current.sex} onChange={(sex) => update({ sex })} />
        </FormField>

        <FormField label="Date de naissance" error={errors.birthDate}>
          <DateInput value={current.birthDate} onChangeText={(value) => update({ birthDate: value })} />
        </FormField>

        <FormField label="Race" missing={!current.breed}>
          <Select
            options={[...OTHER_BREEDS, ...breeds.map((breed) => breed.name)]}
            value={current.breed?.name ?? null}
            onChange={chooseBreed}
            disabled={catalog.status !== 'ready'}
            placeholder={catalog.status === 'loading' ? 'Chargement des races…' : 'Choisis une race'}
            searchPlaceholder="Rechercher une race…"
            emptyMessage="Aucune race trouvée. Recherche « Autre race »."
          />
          {catalog.status === 'error' && (
            <TextLink onPress={retryBreeds}>Liste indisponible. Réessayer</TextLink>
          )}
        </FormField>
      </FormSection>

      <FormSection title="Son caractère" onLayout={({ nativeEvent }) => (sectionY.current.character = nativeEvent.layout.y)}>
        <FormField label="Ce qui lui ressemble" missing={current.traits.length === 0}>
          <View style={styles.chips}>
            {TRAITS.map((trait) => (
              <Chip
                key={trait}
                label={trait}
                color="pink"
                selected={current.traits.includes(trait)}
                onPress={() => update({ traits: toggleValue(current.traits, trait) })}
              />
            ))}
          </View>
        </FormField>

        <FormField label="Sa petite particularité" missing={!current.quirk.trim()}>
          <Input
            placeholder="Ex. Boude si la balade est trop courte"
            value={current.quirk}
            onChangeText={(quirk) => update({ quirk })}
            maxLength={ONBOARDING_LIMITS.quirk}
          />
        </FormField>

        <FormField label="Son jouet préféré" missing={!current.favoriteToy.trim()}>
          <Input
            placeholder="Ex. La poule qui couine"
            value={current.favoriteToy}
            onChangeText={(favoriteToy) => update({ favoriteToy })}
            maxLength={ONBOARDING_LIMITS.favoriteToy}
          />
        </FormField>
      </FormSection>

      <FormSection
        title={current.sex === 'female' ? 'Ce qu’elle aime' : 'Ce qu’il aime'}
        onLayout={({ nativeEvent }) => (sectionY.current.likes = nativeEvent.layout.y)}
      >
        <FormField label="Ses activités préférées" missing={current.activities.length === 0}>
          <View style={styles.chips}>
            {ACTIVITIES.map((activity) => (
              <Chip
                key={activity}
                label={activity}
                color="lime"
                selected={current.activities.includes(activity)}
                onPress={() => update({ activities: toggleValue(current.activities, activity) })}
              />
            ))}
          </View>
        </FormField>

        <FormField label="Sa description" missing={!current.description.trim()}>
          <TextArea
            placeholder="Ce qu’il faut savoir pour une première balade réussie…"
            value={current.description}
            onChangeText={(description) => update({ description })}
            maxLength={ONBOARDING_LIMITS.description}
          />
        </FormField>
      </FormSection>

      <Button variant="danger" icon="trash" onPress={handleRemove} loading={removing}>
        {`Retirer ${sheet.name} de mon compte`}
      </Button>

      <PhotoSourceSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        onSelect={handlePhotoSource}
        onDelete={targetUri ? () => setTargetPhoto(null) : undefined}
        title={targetUri ? 'Changer la photo' : 'Ajouter une photo'}
        subtitle={targetUri ? `Une nouvelle bouille pour ${dogName} ?` : 'Montre-nous sa plus belle bouille'}
      />

      <BottomSheet
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Sa carte de match"
        subtitle="Voilà comment les autres le voient"
      >
        <MatchCard
          size="sm"
          name={dogName}
          photoUri={current.mainPhoto ?? orderedPhotos(current)[0]}
          age={birthDate ? ageInYears(birthDate) : undefined}
          breed={current.breed?.name}
          favoriteToy={current.favoriteToy}
          style={styles.preview}
        />
      </BottomSheet>
    </EditPage>
  )
}

const styles = StyleSheet.create({
  pending: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  saveError: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preview: {
    alignSelf: 'center',
    width: '78%',
    maxWidth: 280,
    aspectRatio: 290 / 400,
  },
})
