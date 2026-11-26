import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, StyleSheet, Text, View, type TextInputInstance } from 'react-native'

import {
  Button,
  EditHeader,
  EditPage,
  FormField,
  FormSection,
  Icon,
  Input,
  PasswordInput,
  type IconName,
} from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { getAuthErrorMessage } from '@/lib/auth-errors'
import { colors, spacing, typography } from '@/theme'

/** Mot à recopier pour débloquer la suppression. */
const CONFIRMATION_WORD = 'SUPPRIMER'

const DELETED_DATA: { icon: IconName; label: string }[] = [
  { icon: 'user', label: 'Ton profil et tes infos personnelles' },
  { icon: 'paw', label: 'Les fiches et les photos de tes chiens' },
  { icon: 'heart', label: 'Tes matchs et tes conversations' },
]

type Field = 'password' | 'confirmation'

/**
 * Profil › Supprimer mon compte. Trois garde-fous : le mot de passe, le mot à recopier,
 * puis une dernière alerte. Une fois le compte supprimé, la session disparaît et la garde
 * du layout racine renvoie vers la connexion.
 */
export default function DeleteAccountScreen() {
  const confirmationRef = useRef<TextInputInstance>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const confirmed = confirmation.trim().toUpperCase() === CONFIRMATION_WORD

  function handleDelete() {
    if (deleting) return

    const nextErrors: Partial<Record<Field, string>> = {}
    if (!password) nextErrors.password = 'Renseigne ton mot de passe.'
    if (!confirmed) nextErrors.confirmation = `Recopie « ${CONFIRMATION_WORD} » pour confirmer.`
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    Alert.alert(
      'Supprimer ton compte ?',
      'Tout sera effacé, et tu ne pourras pas revenir en arrière.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: deleteAccount },
      ],
    )
  }

  async function deleteAccount() {
    setDeleting(true)
    setDeleteError('')

    try {
      const result = await authClient.deleteUser({ password })

      if (result.error) {
        if (result.error.code === 'INVALID_PASSWORD') {
          setErrors({ password: 'Mot de passe incorrect.' })
        } else {
          setDeleteError(getAuthErrorMessage(result.error, 'Impossible de supprimer ton compte.'))
        }
        setDeleting(false)
        return
      }

      // La session est vidée : la garde du layout racine affiche la connexion
      Alert.alert('Compte supprimé', 'À bientôt peut-être, toi et ton chien !')
    } catch (error) {
      console.error('Delete account error:', error)
      setDeleteError('Impossible de contacter le serveur.')
      setDeleting(false)
    }
  }

  return (
    <EditPage
      header={
        <EditHeader title="Supprimer mon compte" backLabel="Retour au profil" onBack={() => router.back()} />
      }
    >
      <FormSection title="Ce qui sera supprimé">
        {DELETED_DATA.map((item) => (
          <View key={item.label} style={styles.item}>
            <Icon name={item.icon} size={20} color={colors.danger} />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>
        ))}
        <Text style={styles.warning}>C’est définitif : ton compte ne pourra pas être récupéré.</Text>
      </FormSection>

      <FormSection title="Confirme la suppression">
        <FormField label="Ton mot de passe" error={errors.password}>
          <PasswordInput
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              setErrors((current) => ({ ...current, password: undefined }))
            }}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmationRef.current?.focus()}
          />
        </FormField>

        <FormField label={`Écris « ${CONFIRMATION_WORD} » pour confirmer`} error={errors.confirmation}>
          <Input
            ref={confirmationRef}
            placeholder={CONFIRMATION_WORD}
            value={confirmation}
            onChangeText={(text) => {
              setConfirmation(text)
              setErrors((current) => ({ ...current, confirmation: undefined }))
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            returnKeyType="done"
            onSubmitEditing={handleDelete}
          />
        </FormField>
      </FormSection>

      {deleteError ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {deleteError}
        </Text>
      ) : null}

      <Button
        variant="danger"
        icon="trash"
        onPress={handleDelete}
        loading={deleting}
        disabled={!confirmed || !password}
      >
        Supprimer définitivement
      </Button>
    </EditPage>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  itemLabel: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  warning: {
    ...typography.small,
    color: colors.danger,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
})
