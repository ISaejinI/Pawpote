import { render, screen, userEvent } from '@testing-library/react-native'

import SignInScreen from '../sign-in'

// Seul le client d'authentification est remplacé : le formulaire, lui, est le vrai
const mockSignInEmail = jest.fn()
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: (...args: unknown[]) => mockSignInEmail(...args) },
    useSession: () => ({ data: null, error: null, isRefetching: false, refetch: jest.fn() }),
  },
}))

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByPlaceholderText('toi@exemple.fr'), email)
  if (password) await user.type(screen.getByPlaceholderText('Ton mot de passe'), password)
  await user.press(screen.getByRole('button', { name: 'Se connecter' }))
}

describe('Connexion', () => {
  beforeEach(() => {
    mockSignInEmail.mockReset()
  })

  it('signale les champs vides ou invalides sans contacter le serveur', async () => {
    await render(<SignInScreen />)

    await fillAndSubmit('pas-un-email', '')

    expect(screen.getByText('Cette adresse e-mail n’est pas valide.')).toBeOnTheScreen()
    expect(screen.getByText('Renseigne ton mot de passe.')).toBeOnTheScreen()
    expect(mockSignInEmail).not.toHaveBeenCalled()
  })

  it('envoie l’e-mail nettoyé et le mot de passe', async () => {
    mockSignInEmail.mockResolvedValue({ data: {}, error: null })
    await render(<SignInScreen />)

    await fillAndSubmit('  rex@exemple.fr ', 'motdepasse123')

    expect(mockSignInEmail).toHaveBeenCalledWith({ email: 'rex@exemple.fr', password: 'motdepasse123' })
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen()
  })

  it('traduit l’erreur renvoyée par l’API pour de mauvais identifiants', async () => {
    mockSignInEmail.mockResolvedValue({ data: null, error: { code: 'INVALID_EMAIL_OR_PASSWORD' } })
    await render(<SignInScreen />)

    await fillAndSubmit('rex@exemple.fr', 'mauvais-mdp')

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou mot de passe incorrect.')
  })

  it('prévient quand le serveur est injoignable', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockSignInEmail.mockRejectedValue(new TypeError('Network request failed'))
    await render(<SignInScreen />)

    await fillAndSubmit('rex@exemple.fr', 'motdepasse123')

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de contacter le serveur.')
  })
})
