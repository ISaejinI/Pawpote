import { useEffect, useState } from 'react'

import { apiUrl } from './api-url'

type Breed = { id: number; name: string }

type CatalogState =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; breeds: Breed[] }

function isBreed(entry: unknown): entry is Breed {
  return !!entry && typeof entry === 'object' &&
    'id' in entry && typeof entry.id === 'number' && Number.isSafeInteger(entry.id) && entry.id > 0 &&
    'name' in entry && typeof entry.name === 'string' && entry.name.length > 0
}

export function useBreedCatalog() {
  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCatalog() {
      try {
        const response = await fetch(`${apiUrl}/api/breeds`, { signal: controller.signal })
        if (!response.ok) throw new Error('Breed catalog request failed')

        const data: { breeds?: unknown } = await response.json()
        if (!Array.isArray(data.breeds) || !data.breeds.length || !data.breeds.every(isBreed)) {
          throw new Error('Invalid breed catalog')
        }

        if (!controller.signal.aborted) setCatalog({ status: 'ready', breeds: data.breeds })
      } catch {
        if (!controller.signal.aborted) setCatalog({ status: 'error' })
      }
    }

    void loadCatalog()
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setCatalog({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  return { catalog, retry }
}
