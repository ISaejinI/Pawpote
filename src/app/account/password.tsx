import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, StyleSheet, Text, type TextInputInstance } from 'react-native'

import { Callout, EditHeader, EditPage, FormField, FormSection, PasswordInput } from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { getAuthErrorMessage } from '@/lib/auth-errors'
import { useLeaveConfirmation } from '@/lib/use-leave-confirmation'
import { colors, typography } from '@/theme'

const MIN_PASSWORD_LENGTH = 8

type Field = 'currentPassword' | 'newPassword' | 'confirmPassword'

/** Profil › Mot de passe : le mot de passe actuel est demandé pour le changer. */
export default function PasswordScreen() {
  const newPasswordRef = useRef<TextInputInstance>(null)
  const confirmRef = useRef<TextInputInstance>(null)

  const [values, setValues] = useState<Record<Field, string>>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const allowLeave = useLeaveConfirmation(Object.values(values).some(Boolean))

  function update(field: Field) {
    return (text: string) => {
      setValues((current) => ({ ...current, [field]: text }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSave() {
    if (saving) return

    const nextErrors: Partial<Record<Field, string>> = {}
    if (!values.currentPassword) nextErrors.currentPassword = 'Renseigne ton mot de passe actuel.'
    if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.newPassword = `Au moins ${MIN_PASSWORD_LENGTH} caractères.`
    } else if (values.newPassword === values.currentPassword) {
      nextErrors.newPassword = 'Choisis un mot de passe différent de l’actuel.'
    }
    if (values.confirmPassword !== values.newPassword) {
      nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSaving(true)
    setSaveError('')

    try {
      const result = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        // Déconnecte les autres appareils : utile si l'ancien mot de passe a fuité
        revokeOtherSessions: true,
      })

      if (result.error) {
        if (result.error.code === 'INVALID_PASSWORD') {
          setErrors({ currentPassword: getAuthErrorMessage(result.error, '') })
        } else {
          setSaveError(getAuthErrorMessage(result.error, 'Impossible de changer ton mot de passe.'))
        }
        return
      }

      allowLeave()
      router.back()
      Alert.alert('Mot de passe modifié', 'Tes autres appareils ont été déconnectés.')
    } catch (error) {
      console.error('Change password error:', error)
      setSaveError('Impossible de contacter le serveur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <EditPage
      header={
        <EditHeader
          title="Mot de passe"
          backLabel="Retour au profil"
          onBack={() => router.back()}
          actionLabel="Enregistrer"
          onAction={handleSave}
          loading={saving}
        />
      }
    >
      {saveError ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {saveError}
        </Text>
      ) : null}

      <FormSection title="Change ton mot de passe">
        <FormField label="Mot de passe actuel" error={errors.currentPassword}>
          <PasswordInput
            value={values.currentPassword}
            onChangeText={update('currentPassword')}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />
        </FormField>

        <FormField label="Nouveau mot de passe" error={errors.newPassword}>
          <PasswordInput
            ref={newPasswordRef}
            placeholder={`${MIN_PASSWORD_LENGTH} caractères minimum`}
            value={values.newPassword}
            onChangeText={update('newPassword')}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
        </FormField>

        <FormField label="Confirme le nouveau mot de passe" error={errors.confirmPassword}>
          <PasswordInput
            ref={confirmRef}
            placeholder="Le même, une deuxième fois"
            value={values.confirmPassword}
            onChangeText={update('confirmPassword')}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </FormField>
      </FormSection>

      <Callout variant="info" icon="lock">
        Tes autres appareils seront déconnectés : il faudra t’y reconnecter avec le nouveau mot de passe.
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
})
