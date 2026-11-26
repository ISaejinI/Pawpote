import { fireEvent, render, screen } from '@testing-library/react-native'

import { Button } from '../button'

describe('Button', () => {
  it('lance son action quand on appuie dessus', async () => {
    const onPress = jest.fn()
    await render(<Button onPress={onPress}>Continuer</Button>)

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('ignore les appuis pendant le chargement, pour éviter un double envoi', async () => {
    const onPress = jest.fn()
    await render(<Button onPress={onPress} loading>Enregistrer</Button>)

    const button = screen.getByRole('button', { name: 'Enregistrer' })
    await fireEvent.press(button)

    expect(onPress).not.toHaveBeenCalled()
    expect(button).toBeBusy()
  })

  it('ignore les appuis quand il est désactivé', async () => {
    const onPress = jest.fn()
    await render(<Button onPress={onPress} disabled>Supprimer</Button>)

    const button = screen.getByRole('button', { name: 'Supprimer' })
    await fireEvent.press(button)

    expect(onPress).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })
})
