import { describe, expect, it } from 'vitest'

import { api, authApi, createDog, PASSWORD, signUp } from './helpers'

describe('Authentification', () => {
  it('crée un compte, ouvre une session et prépare le profil du propriétaire', async () => {
    const user = await signUp('Camille')

    const session = await authApi('/get-session', { cookie: user.cookie })
    expect(await session.json()).toMatchObject({ user: { id: user.id, email: user.email } })

    const profile = await api('/api/profile', { cookie: user.cookie })
    expect(profile.status).toBe(200)
    expect(await profile.json()).toMatchObject({ owner: { firstName: 'Camille' }, dogs: [] })
  })

  it('refuse un mot de passe incorrect', async () => {
    const user = await signUp()

    const response = await authApi('/sign-in/email', { body: { email: user.email, password: 'mauvais-mot-de-passe' } })

    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({ code: 'INVALID_EMAIL_OR_PASSWORD' })
  })

  it.each([
    ['un e-mail invalide', { email: 'pas-un-email', password: PASSWORD, name: 'Test' }],
    ['un mot de passe trop court', { email: 'court@example.test', password: '123', name: 'Test' }],
  ])('refuse une inscription avec %s', async (_, body) => {
    const response = await authApi('/sign-up/email', { body })
    expect(response.status).toBe(400)
  })
})

describe('Accès aux routes protégées', () => {
  it.each([
    ['GET', '/api/discovery'],
    ['POST', '/api/discovery/swipes'],
    ['GET', '/api/messaging'],
    ['GET', '/api/profile'],
    ['GET', '/api/onboarding'],
  ] as const)('%s %s exige une connexion', async (method, path) => {
    const response = await api(path, { method, body: method === 'POST' ? {} : undefined })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Connexion requise.' })
  })

  it('rejette une session inventée', async () => {
    const response = await api('/api/profile', { cookie: 'better-auth.session_token=faux-jeton' })
    expect(response.status).toBe(401)
  })

  it('rejette un envoi depuis un site inconnu, même connecté', async () => {
    const user = await signUp()

    const response = await api('/api/discovery/location', {
      cookie: user.cookie,
      body: { latitude: 48.85, longitude: 2.35 },
      headers: { Origin: 'https://site-malveillant.example' },
    })

    expect(response.status).toBe(403)
  })

  it('exige du JSON pour les envois', async () => {
    const user = await signUp()

    const response = await api('/api/discovery/location', {
      cookie: user.cookie,
      body: 'latitude=48.85',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    expect(response.status).toBe(415)
  })
})

describe('Suppression du compte', () => {
  it('exige le bon mot de passe, puis efface le compte et ses chiens', async () => {
    const user = await signUp()
    await createDog(user.id, 'Rex')

    const withoutPassword = await authApi('/delete-user', { cookie: user.cookie, body: {} })
    expect(withoutPassword.status).toBe(400)
    expect(await withoutPassword.json()).toMatchObject({ code: 'PASSWORD_REQUIRED' })

    const wrongPassword = await authApi('/delete-user', { cookie: user.cookie, body: { password: 'mauvais' } })
    expect(await wrongPassword.json()).toMatchObject({ code: 'INVALID_PASSWORD' })

    const deleted = await authApi('/delete-user', { cookie: user.cookie, body: { password: PASSWORD } })
    expect(deleted.status).toBe(200)

    const signIn = await authApi('/sign-in/email', { body: { email: user.email, password: PASSWORD } })
    expect(signIn.status).toBe(401)
  })
})
