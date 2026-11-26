import { fireEvent, render, screen } from '@testing-library/react-native'

import { SwipeActions } from '../swipe-actions'

describe('SwipeActions', () => {
  it('envoie « J’aime » ou « Passer » pour le chien affiché', async () => {
    const onLike = jest.fn()
    const onPass = jest.fn()
    await render(<SwipeActions dogName="Rex" onLike={onLike} onPass={onPass} />)

    await fireEvent.press(screen.getByRole('button', { name: 'J’aime Rex' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Passer Rex' }))

    expect(onLike).toHaveBeenCalledTimes(1)
    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('bloque les deux boutons pendant l’envoi d’un choix', async () => {
    const onLike = jest.fn()
    const onPass = jest.fn()
    await render(<SwipeActions dogName="Rex" onLike={onLike} onPass={onPass} disabled />)

    await fireEvent.press(screen.getByRole('button', { name: 'J’aime Rex' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Passer Rex' }))

    expect(onLike).not.toHaveBeenCalled()
    expect(onPass).not.toHaveBeenCalled()
  })
})
