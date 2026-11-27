import { randomUUID } from 'node:crypto'

import app from '../src'
import { db } from '../src/db'
import { dogs } from '../src/db/schema'

export const PASSWORD = 'motdepasse-de-test'

type RequestOptions = { method?: 'GET' | 'POST'; body?: unknown; cookie?: string; headers?: Record<string, string> }

/** Appelle l'API comme le fait l'app mobile : JSON et cookie de session, sans en-tête Origin. */
export function api(path: string, { method, body, cookie, headers = {} }: RequestOptions = {}) {
  return app.request(path, {
    method: method ?? (body === undefined ? 'GET' : 'POST'),
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

/** Routes Better Auth : l'app y envoie l'origine de son schéma d'URL. */
export function authApi(path: string, options: RequestOptions = {}) {
  return api(`/api/auth${path}`, { ...options, headers: { Origin: 'pawpote://', ...options.headers } })
}

export type TestUser = { id: string; email: string; cookie: string }

/** Crée un compte de test (e-mail unique) et renvoie son cookie de session. */
export async function signUp(firstName = 'Testeur'): Promise<TestUser> {
  const email = `test-${randomUUID()}@example.test`
  const response = await authApi('/sign-up/email', {
    body: { email, password: PASSWORD, name: firstName, firstName },
  })
  if (response.status !== 200) throw new Error(`Inscription impossible : ${await response.text()}`)

  const { user } = (await response.json()) as { user: { id: string } }
  const cookie = response.headers.getSetCookie().map((value) => value.split(';')[0]).join('; ')
  return { id: user.id, email, cookie }
}

/** Ajoute directement un chien en base, pour préparer un scénario. */
export async function createDog(ownerId: string, name: string) {
  const [dog] = await db.insert(dogs).values({ ownerId, name }).returning({ id: dogs.id })
  return dog.id
}

/** Deux maîtres dont les chiens se sont « likés » mutuellement. */
export async function createMatch() {
  const [alice, bob] = [await signUp('Alice'), await signUp('Bob')]
  const [rex, mia] = [await createDog(alice.id, 'Rex'), await createDog(bob.id, 'Mia')]

  await api('/api/discovery/swipes', { cookie: alice.cookie, body: { dogId: mia, action: 'like' } })
  const response = await api('/api/discovery/swipes', { cookie: bob.cookie, body: { dogId: rex, action: 'like' } })
  const { matches } = (await response.json()) as { matches: { id: string }[] }

  return { alice, bob, rex, mia, matchId: matches[0].id }
}
