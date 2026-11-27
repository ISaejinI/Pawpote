import { useRef, useState } from 'react'
import { StyleSheet, Text, type TextInputInstance } from 'react-native'

import { AuthLayout } from '@/features/auth/components/auth-layout'
import { Button, FormField, Input, PasswordInput } from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { getAuthErrorMessage, isValidEmail } from '@/features/auth/auth-errors'
import { colors, typography } from '@/theme'

type FieldErrors = Partial<Record<'email' | 'password', string>>

export default function SignInScreen() {
  const passwordRef = useRef<TextInputInstance>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')

  function validate() {
    const errors: FieldErrors = {}

    if (!email.trim()) errors.email = 'Renseigne ton adresse e-mail.'
    else if (!isValidEmail(email.trim())) errors.email = 'Cette adresse e-mail n’est pas valide.'

    if (!password) errors.password = 'Renseigne ton mot de passe.'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignIn() {
    if (loading || !validate()) return

    setLoading(true)
    setError('')

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      })

      if (result.error) {
        setError(getAuthErrorMessage(result.error, 'Connexion impossible.'))
      }
    } catch (caught) {
      console.error('Better Auth sign-in error:', caught)
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="sign-in" tagline="Content de te revoir !">
      <FormField label="Adresse e-mail" error={fieldErrors.email}>
        <Input
          placeholder="toi@exemple.fr"
          value={email}
          onChangeText={(text) => {
            setEmail(text)
            setFieldErrors((errors) => ({ ...errors, email: undefined }))
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />
      </FormField>

      <FormField label="Mot de passe" error={fieldErrors.password}>
        <PasswordInput
          ref={passwordRef}
          placeholder="Ton mot de passe"
          value={password}
          onChangeText={(text) => {
            setPassword(text)
            setFieldErrors((errors) => ({ ...errors, password: undefined }))
          }}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSignIn}
          editable={!loading}
        />
      </FormField>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button onPress={handleSignIn} loading={loading}>
        Se connecter
      </Button>
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
})
