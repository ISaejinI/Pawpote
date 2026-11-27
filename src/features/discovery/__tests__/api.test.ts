import { DEFAULT_DISCOVERY_FILTERS } from '@shared/discovery'
import { formatDiscoveryDistance, getDiscoveryFeed, sendSwipe } from '../api'

jest.mock('@/lib/auth-client', () => ({
  authClient: { getCookie: () => 'better-auth.session_token=test' },
}))

function mockFetch(status: number, body: unknown = {}) {
  return jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  )
}

describe('discovery-api', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('envoie les filtres dans l’URL avec le cookie de session', async () => {
    const fetchSpy = mockFetch(200, { dogs: [], canRestart: false })

    await getDiscoveryFeed(
      { ...DEFAULT_DISCOVERY_FILTERS, sizes: ['small', 'medium'], sex: 'female', nearby: true, radiusKm: 10 },
      new AbortController().signal,
    )

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.test/api/discovery?sizes=small%2Cmedium&sex=female&nearby=1&radiusKm=10')
    expect(new Headers(init?.headers).get('Cookie')).toBe('better-auth.session_token=test')
  })

  it('lève une erreur avec le code HTTP quand l’API refuse la requête', async () => {
    mockFetch(401, { error: 'Connexion requise.' })

    await expect(sendSwipe('dog-id', 'like')).rejects.toMatchObject({ cause: 401 })
  })

  it('affiche les distances de façon lisible', () => {
    expect(formatDiscoveryDistance(2.345)).toBe('2,3 km')
    expect(formatDiscoveryDistance(0.4, true)).toBe('moins de 1 km')
    expect(formatDiscoveryDistance(null)).toBeUndefined()
  })
})
