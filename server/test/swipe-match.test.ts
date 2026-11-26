import { randomUUID } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { api, createDog, signUp, type TestUser } from './helpers'

function swipe(user: TestUser, dogId: string, action: 'like' | 'dislike') {
  return api('/api/discovery/swipes', { cookie: user.cookie, body: { dogId, action } })
}

async function feedDogNames(user: TestUser) {
  const response = await api('/api/discovery', { cookie: user.cookie })
  const { dogs } = (await response.json()) as { dogs: { name: string }[] }
  return dogs.map(({ name }) => name)
}

describe('Découverte et swipe', () => {
  it('propose les chiens des autres, jamais les siens, et retire ceux déjà vus', async () => {
    const [alice, bob] = [await signUp('Alice'), await signUp('Bob')]
    await createDog(alice.id, 'Rex')
    const mia = await createDog(bob.id, 'Mia')

    const before = await feedDogNames(alice)
    expect(before).toContain('Mia')
    expect(before).not.toContain('Rex')

    await swipe(alice, mia, 'dislike')
    expect(await feedDogNames(alice)).not.toContain('Mia')
  })

  it('refuse des filtres invalides', async () => {
    const user = await signUp()
    const response = await api('/api/discovery?sizes=geant&radiusKm=-3', { cookie: user.cookie })
    expect(response.status).toBe(400)
  })

  it.each([
    ['sans chien', { action: 'like' }],
    ['avec un identifiant invalide', { dogId: 'pas-un-uuid', action: 'like' }],
    ['avec une action inconnue', { dogId: randomUUID(), action: 'superlike' }],
  ])('refuse un swipe %s', async (_, body) => {
    const user = await signUp()
    const response = await api('/api/discovery/swipes', { cookie: user.cookie, body })
    expect(response.status).toBe(400)
  })

  it('refuse de swiper son propre chien ou un chien inexistant', async () => {
    const user = await signUp()
    const ownDog = await createDog(user.id, 'Rex')

    expect((await swipe(user, ownDog, 'like')).status).toBe(404)
    expect((await swipe(user, randomUUID(), 'like')).status).toBe(404)
  })
})

describe('Match', () => {
  it('ne crée pas de match tant qu’un seul des deux a aimé', async () => {
    const [alice, bob] = [await signUp('Alice'), await signUp('Bob')]
    await createDog(alice.id, 'Rex')
    const mia = await createDog(bob.id, 'Mia')

    const response = await swipe(alice, mia, 'like')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ matches: [] })
  })

  it('crée un match quand les deux chiens s’aiment, visible des deux maîtres', async () => {
    const [alice, bob] = [await signUp('Alice'), await signUp('Bob')]
    const rex = await createDog(alice.id, 'Rex')
    const mia = await createDog(bob.id, 'Mia')

    await swipe(alice, mia, 'like')
    const response = await swipe(bob, rex, 'like')

    const { matches } = (await response.json()) as { matches: { id: string; ownDog: string; targetDog: string }[] }
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({ ownDog: 'Mia', targetDog: 'Rex' })

    for (const [user, otherDog] of [[alice, 'Mia'], [bob, 'Rex']] as const) {
      const list = await api('/api/messaging', { cookie: user.cookie })
      expect(await list.json()).toEqual([expect.objectContaining({ id: matches[0].id, dogName: otherDog })])
    }
  })

  it('ne crée pas de match si l’un des deux a passé', async () => {
    const [alice, bob] = [await signUp('Alice'), await signUp('Bob')]
    const rex = await createDog(alice.id, 'Rex')
    const mia = await createDog(bob.id, 'Mia')

    await swipe(alice, mia, 'dislike')
    const response = await swipe(bob, rex, 'like')

    expect(await response.json()).toEqual({ matches: [] })
  })
})
