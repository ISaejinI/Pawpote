import { useRef, useState } from 'react'
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Button, FormField, Input, PasswordInput } from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { getAuthErrorMessage, isValidEmail } from '@/lib/auth-errors'
import { colors, typography } from '@/theme'

const MIN_PASSWORD_LENGTH = 8

type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword'
type FieldErrors = Partial<Record<Field, string>>

export default function SignUpScreen() {
  const lastNameRef = useRef<TextInputInstance>(null)
  const emailRef = useRef<TextInputInstance>(null)
  const passwordRef = useRef<TextInputInstance>(null)
  const confirmRef = useRef<TextInputInstance>(null)

  const [values, setValues] = useState<Record<Field, string>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')

  function update(field: Field) {
    return (text: string) => {
      setValues((current) => ({ ...current, [field]: text }))
      setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
    }
  }

  function validate() {
    const errors: FieldErrors = {}
    const email = values.email.trim()

    if (!values.firstName.trim()) errors.firstName = 'Renseigne ton prénom.'
    if (!values.lastName.trim()) errors.lastName = 'Renseigne ton nom.'

    if (!email) errors.email = 'Renseigne ton adresse e-mail.'
    else if (!isValidEmail(email)) errors.email = 'Cette adresse e-mail n’est pas valide.'

    if (values.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Au moins ${MIN_PASSWORD_LENGTH} caractères.`
    }
    if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignUp() {
    if (loading || !validate()) return

    setLoading(true)
    setError('')

    try {
      const firstName = values.firstName.trim()
      const lastName = values.lastName.trim()

      const body = {
        // `name` (Better Auth) réunit prénom et nom pour l'affichage
        name: `${firstName} ${lastName}`,
        email: values.email.trim(),
        password: values.password,
        // Champs en plus, lus par le serveur pour créer la ligne `profiles` du propriétaire.
        // Ils ne font pas partie du type de Better Auth : d'où l'objet intermédiaire.
        firstName,
        lastName,
      }

      const result = await authClient.signUp.email(body)

      if (result.error) {
        setError(getAuthErrorMessage(result.error, 'Inscription impossible.'))
      }
    } catch (caught) {
      console.error('Better Auth sign-up error:', caught)
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="sign-up" tagline="Bienvenue dans la meute !">
      <View style={styles.row}>
        <FormField label="Prénom" error={fieldErrors.firstName} style={styles.half}>
          <Input
            placeholder="Camille"
            value={values.firstName}
            onChangeText={update('firstName')}
            autoComplete="given-name"
            textContentType="givenName"
            autoCapitalize="words"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => lastNameRef.current?.focus()}
            editable={!loading}
          />
        </FormField>

        <FormField label="Nom" error={fieldErrors.lastName} style={styles.half}>
          <Input
            ref={lastNameRef}
            placeholder="Martin"
            value={values.lastName}
            onChangeText={update('lastName')}
            autoComplete="family-name"
            textContentType="familyName"
            autoCapitalize="words"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
            editable={!loading}
          />
        </FormField>
      </View>

      <FormField label="Adresse e-mail" error={fieldErrors.email}>
        <Input
          ref={emailRef}
          placeholder="toi@exemple.fr"
          value={values.email}
          onChangeText={update('email')}
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
          placeholder={`${MIN_PASSWORD_LENGTH} caractères minimum`}
          value={values.password}
          onChangeText={update('password')}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!loading}
        />
      </FormField>

      <FormField label="Confirme ton mot de passe" error={fieldErrors.confirmPassword}>
        <PasswordInput
          ref={confirmRef}
          placeholder="Le même, une deuxième fois"
          value={values.confirmPassword}
          onChangeText={update('confirmPassword')}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSignUp}
          editable={!loading}
        />
      </FormField>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button onPress={handleSignUp} loading={loading}>
        Créer mon compte
      </Button>
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
})
