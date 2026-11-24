import { Link } from 'expo-router'
import { useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'

import { authClient } from '@/lib/auth-client'

export default function SignInScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    async function handleSignIn() {
        if (!email.trim() || !password) {
            setError('Renseigne ton email et ton mot de passe.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await authClient.signIn.email({
                email: email.trim(),
                password,
            })

            if (result.error) {
                setError(result.error.message ?? 'Connexion impossible.')
            }
        } catch (error) {
            console.error('Better Auth sign-in error:', error)

            setError(
                error instanceof Error
                    ? error.message
                    : 'Impossible de contacter le serveur.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <Text style={styles.logo}>🐾 Pawpote</Text>
                <Text style={styles.title}>Bon retour !</Text>
                <Text style={styles.subtitle}>
                    Connecte-toi pour retrouver tes futurs copains.
                </Text>

                <Text style={styles.label}>Adresse email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ton@email.fr"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                />

                <Text style={styles.label}>Mot de passe</Text>

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Ton mot de passe"
                        secureTextEntry={!showPassword}
                        autoComplete="current-password"
                        value={password}
                        onChangeText={setPassword}
                        editable={!loading}
                    />

                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        accessibilityRole="button"
                        accessibilityLabel={
                            showPassword
                                ? 'Masquer le mot de passe'
                                : 'Afficher le mot de passe'
                        }
                    >
                        <Text style={styles.passwordToggle}>
                            {showPassword ? 'Masquer' : 'Afficher'}
                        </Text>
                    </Pressable>
                </View>


                {error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : null}

                <Pressable
                    style={[styles.button, loading && styles.disabled]}
                    onPress={handleSignIn}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </Pressable>

                <Link href="/sign-up" style={styles.link}>
                    Pas encore de compte ? S'inscrire
                </Link>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        gap: 12,
    },
    logo: {
        fontSize: 23,
        fontWeight: '700',
        color: '#208AEF',
        marginBottom: 18,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1B1B1B',
    },
    subtitle: {
        fontSize: 15,
        color: '#666666',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#1B1B1B',
    },
    button: {
        backgroundColor: '#208AEF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    disabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    error: {
        color: '#C62828',
        fontSize: 14,
    },
    link: {
        color: '#208AEF',
        textAlign: 'center',
        marginTop: 16,
        fontWeight: '600',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#1B1B1B',
    },
    passwordToggle: {
        color: '#208AEF',
        fontWeight: '600',
    },
})