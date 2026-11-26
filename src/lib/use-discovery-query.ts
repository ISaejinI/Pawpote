import { useCallback, useEffect, useState } from 'react'

export function useDiscoveryQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<unknown>()
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal).then(
      (result) => { if (!controller.signal.aborted) setData(result) },
      (cause: unknown) => { if (!controller.signal.aborted) setError(cause) },
    )
    return () => controller.abort()
  }, [load, attempt])

  const retry = useCallback(() => {
    setData(undefined)
    setError(undefined)
    setAttempt((current) => current + 1)
  }, [])

  return { data, setData, error, retry }
}
