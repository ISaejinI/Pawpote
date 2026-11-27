import { fireEvent, render, screen } from '@testing-library/react-native'

import { PasswordInput } from '../password-input'

describe('PasswordInput', () => {
  it('masque le mot de passe, puis l’affiche à la demande', async () => {
    await render(<PasswordInput placeholder="Ton mot de passe" />)
    const input = screen.getByPlaceholderText('Ton mot de passe')

    expect(input.props.secureTextEntry).toBe(true)

    await fireEvent.press(screen.getByRole('button', { name: 'Afficher le mot de passe' }))
    expect(input.props.secureTextEntry).toBe(false)

    await fireEvent.press(screen.getByRole('button', { name: 'Masquer le mot de passe' }))
    expect(input.props.secureTextEntry).toBe(true)
  })
})
