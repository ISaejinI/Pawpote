import { useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'

import { watchChat } from './api'

export function useChatQuery<T>(load: (signal: AbortSignal) => Promise<T>, merge?: (current: T | undefined, incoming: T) => T) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<unknown>()
  const requestRefresh = useRef<(() => void) | undefined>(undefined)
  const refresh = useCallback(() => requestRefresh.current?.(), [])

  useFocusEffect(useCallback(() => {
    const lifecycle = new AbortController()
    let busy = false
    let pending = false
    function fetchLatest() {
      if (lifecycle.signal.aborted) return
      if (busy) {
        pending = true
        return
      }
      busy = true
      void load(lifecycle.signal).then(
        (next) => {
          if (!lifecycle.signal.aborted) {
            setData((current) => merge ? merge(current, next) : next)
            setError(undefined)
          }
        },
        (failure: unknown) => {
          if (lifecycle.signal.aborted) return
          if (failure instanceof Error && (failure.cause === 401 || failure.cause === 404)) setData(undefined)
          setError(failure)
        },
      ).finally(() => {
        busy = false
        if (pending) {
          pending = false
          fetchLatest()
        }
      })
    }
    requestRefresh.current = fetchLatest
    fetchLatest()
    const stop = watchChat(fetchLatest)
    return () => {
      lifecycle.abort()
      requestRefresh.current = undefined
      stop()
    }
  }, [load, merge]))

  return { data, error, refresh }
}
