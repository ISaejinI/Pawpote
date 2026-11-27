import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'

import { Callout, EditHeader, EditPage, FormField, FormSection, Input } from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { getAuthErrorMessage, isValidEmail } from '@/features/auth/auth-errors'
import { useLeaveConfirmation } from '@/lib/use-leave-confirmation'
import { colors, typography } from '@/theme'

/** Profil › Adresse e-mail : remplace l'adresse de connexion. */
export default function EmailScreen() {
  const { data: session, refetch } = authClient.useSession()
  const currentEmail = session?.user.email ?? ''

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const allowLeave = useLeaveConfirmation(email.trim().length > 0)

  async function handleSave() {
    if (saving) return

    const newEmail = email.trim().toLowerCase()
    if (!isValidEmail(newEmail)) {
      setFieldError('Cette adresse e-mail n’est pas valide.')
      return
    }
    if (newEmail === currentEmail.toLowerCase()) {
      setFieldError('C’est déjà ton adresse actuelle.')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      const result = await authClient.changeEmail({ newEmail })
      if (result.error) {
        setSaveError(getAuthErrorMessage(result.error, 'Impossible de changer ton adresse e-mail.'))
        return
      }

      // Une adresse déjà prise est refusée sans le dire (pour ne pas révéler les comptes existants) :
      // on vérifie donc que la session porte bien la nouvelle adresse
      const fresh = await authClient.getSession({ query: { disableCookieCache: true } })
      if (fresh.data?.user.email !== newEmail) {
        setSaveError('Impossible d’utiliser cette adresse e-mail. Essaie avec une autre.')
        return
      }

      void refetch()
      allowLeave()
      router.back()
    } catch (error) {
      console.error('Change email error:', error)
      setSaveError('Impossible de contacter le serveur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <EditPage
      header={
        <EditHeader
          title="E-mail"
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

      <FormSection title="Ton adresse e-mail">
        <FormField label="Adresse actuelle">
          <Input value={currentEmail} editable={false} />
        </FormField>

        <FormField label="Nouvelle adresse" error={fieldError}>
          <Input
            placeholder="toi@exemple.fr"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setFieldError('')
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </FormField>
      </FormSection>

      <Callout variant="info" icon="mail">
        Tu te connecteras ensuite avec ta nouvelle adresse, et le même mot de passe.
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
