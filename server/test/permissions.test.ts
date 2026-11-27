import { randomUUID } from 'node:crypto'

import { beforeAll, describe, expect, it } from 'vitest'

import { api, createMatch, signUp, type TestUser } from './helpers'

let scenario: Awaited<ReturnType<typeof createMatch>>
let outsider: TestUser

beforeAll(async () => {
  scenario = await createMatch()
  outsider = await signUp('Intrus')
})

function sendText(user: TestUser, body: string) {
  return api(`/api/messaging/${scenario.matchId}`, {
    cookie: user.cookie,
    body: { kind: 'text', id: randomUUID(), body },
  })
}

describe('Messagerie', () => {
  it('permet aux deux maîtres du match d’échanger', async () => {
    const sent = await sendText(scenario.alice, 'On se balade samedi ?')
    expect(sent.status).toBe(201)

    const thread = await api(`/api/messaging/${scenario.matchId}`, { cookie: scenario.bob.cookie })
    const { messages } = (await thread.json()) as { messages: { body: string; own: boolean }[] }
    expect(messages).toContainEqual(expect.objectContaining({ body: 'On se balade samedi ?', own: false }))
  })

  it('refuse un message vide ou trop long', async () => {
    expect((await sendText(scenario.alice, '   ')).status).toBe(400)
    expect((await sendText(scenario.alice, 'a'.repeat(1001))).status).toBe(400)
  })

  it('cache la conversation à quelqu’un d’extérieur au match', async () => {
    const thread = await api(`/api/messaging/${scenario.matchId}`, { cookie: outsider.cookie })
    expect(thread.status).toBe(404)

    expect((await sendText(outsider, 'Coucou')).status).toBe(404)

    const list = await api('/api/messaging', { cookie: outsider.cookie })
    expect(await list.json()).toEqual([])
  })

  it('ne laisse que l’autre maître accepter une proposition de balade', async () => {
    const proposal = await api(`/api/messaging/${scenario.matchId}`, {
      cookie: scenario.alice.cookie,
      body: {
        kind: 'walk',
        id: randomUUID(),
        place: 'Parc des Buttes-Chaumont',
        startsAt: new Date(Date.now() + 86_400_000).toISOString(),
        minutes: 60,
      },
    })
    const { id } = (await proposal.json()) as { id: string }
    const accept = (user: TestUser) =>
      api(`/api/messaging/${scenario.matchId}/walks/${id}`, { cookie: user.cookie, body: { action: 'accept' } })

    expect((await accept(scenario.alice)).status).toBe(409)
    expect((await accept(outsider)).status).toBe(404)
    expect((await accept(scenario.bob)).status).toBe(200)
  })
})

describe('Fiches des chiens', () => {
  it('empêche de lire, modifier ou supprimer le chien d’un autre maître', async () => {
    const path = `/api/profile/dogs/${scenario.rex}`

    expect((await api(path, { cookie: outsider.cookie })).status).toBe(404)
    expect((await api(path, { cookie: outsider.cookie, body: { name: 'Volé' } })).status).toBe(404)
    expect((await api(`${path}/delete`, { cookie: outsider.cookie, body: {} })).status).toBe(404)

    // Le chien est toujours là pour son maître
    expect((await api(path, { cookie: scenario.alice.cookie })).status).toBe(200)
  })
})
