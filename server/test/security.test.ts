import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db } from '../src/db'
import { profiles } from '../src/db/schema'
import { SIGN_IN_MAX_ATTEMPTS } from '../src/modules/auth/sign-in-limit'
import { api, authApi, createDog, PASSWORD, signUp, type TestUser } from './helpers'

function setLocation(user: TestUser, latitude: number, longitude: number) {
  return api('/api/discovery/location', { cookie: user.cookie, body: { latitude, longitude } })
}

function signIn(email: string, password: string, ip?: string) {
  return authApi('/sign-in/email', {
    body: { email, password },
    headers: ip ? { 'x-forwarded-for': ip } : {},
  })
}

describe('Position des utilisateurs', () => {
  it('n’enregistre jamais la position GPS exacte', async () => {
    const user = await signUp()

    expect((await setLocation(user, 48.856613, 2.352222)).status).toBe(200)

    const [saved] = await db.select({ latitude: profiles.latitude, longitude: profiles.longitude })
      .from(profiles).where(eq(profiles.userId, user.id))
    expect(saved).toEqual({ latitude: 48.855, longitude: 2.35 })
  })

  it('affiche les distances au kilomètre près, jamais sous 1 km', async () => {
    const [alice, bob, carla] = [await signUp('Alice'), await signUp('Bob'), await signUp('Carla')]
    const nearDog = await createDog(bob.id, 'Voisin')
    const farDog = await createDog(carla.id, 'Lointain')
    await setLocation(alice, 48.8566, 2.3522)
    await setLocation(bob, 48.8580, 2.3540) // environ 200 m
    await setLocation(carla, 48.8780, 2.3522) // environ 2,4 km

    const distance = async (dogId: string) => {
      const response = await api(`/api/discovery/dogs/${dogId}?nearby=1`, { cookie: alice.cookie })
      return ((await response.json()) as { distanceKm: number }).distanceKm
    }

    expect(await distance(nearDog)).toBe(1)
    expect(Number.isInteger(await distance(farDog))).toBe(true)
  })
})

describe('Tentatives de connexion', () => {
  it(`bloque un compte après ${SIGN_IN_MAX_ATTEMPTS} essais, même avec le bon mot de passe ensuite`, async () => {
    const victim = await signUp()
    const other = await signUp()

    for (let attempt = 0; attempt < SIGN_IN_MAX_ATTEMPTS; attempt++) {
      expect((await signIn(victim.email, 'mauvais-mot-de-passe')).status).toBe(401)
    }

    const blocked = await signIn(victim.email, PASSWORD)
    expect(blocked.status).toBe(429)
    expect(await blocked.json()).toMatchObject({ code: 'TOO_MANY_SIGN_IN_ATTEMPTS' })

    // Les autres comptes ne sont pas concernés
    expect((await signIn(other.email, PASSWORD)).status).toBe(200)
  })

  it('remet le compteur à zéro après une connexion réussie', async () => {
    const user = await signUp()

    for (let attempt = 0; attempt < SIGN_IN_MAX_ATTEMPTS - 1; attempt++) {
      await signIn(user.email, 'mauvais-mot-de-passe')
    }
    expect((await signIn(user.email, PASSWORD)).status).toBe(200)

    for (let attempt = 0; attempt < SIGN_IN_MAX_ATTEMPTS - 1; attempt++) {
      expect((await signIn(user.email, 'mauvais-mot-de-passe')).status).toBe(401)
    }
  })

  it('limite aussi les essais rapprochés depuis une même adresse IP', async () => {
    const ip = '203.0.113.7'
    const statuses = []
    for (let attempt = 0; attempt < 4; attempt++) {
      statuses.push((await signIn(`inconnu-${attempt}@example.test`, 'mot-de-passe', ip)).status)
    }

    expect(statuses).toEqual([401, 401, 401, 429])
  })

  it('ne regroupe pas tout le monde quand l’adresse IP du client est incertaine', async () => {
    const statuses = []
    for (let attempt = 0; attempt < 4; attempt++) {
      statuses.push((await signIn(`anonyme-${attempt}@example.test`, 'mot-de-passe', '198.51.100.1, 10.0.0.1')).status)
    }

    expect(statuses).not.toContain(429)
  })
})
