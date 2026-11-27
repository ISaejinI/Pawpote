import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { MatchFiltersSheet } from '@/components/match/match-filters-sheet'
import { MatchHeader } from '@/components/match/match-header'
import { SwipeDeck } from '@/components/swipe/swipe-deck'
import { Button, TabPage } from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { getDiscoveryFeed, restartDiscovery, saveDiscoveryLocation } from '@/lib/discovery-api'
import { getMatchPosition } from '@/lib/match-location'
import { readMatchPreferences, saveMatchPreferences } from '@/lib/match-preferences'
import { useDiscoveryQuery } from '@/lib/use-discovery-query'
import { colors, radius, spacing, typography } from '@/theme'
import {
  DEFAULT_DISCOVERY_FILTERS, type Coordinates, type DiscoveryFilters,
} from '@shared/discovery'

const RESTART_SHADOW_OFFSET = 4

export default function MatchScreen() {
  const { data: session } = authClient.useSession()
  return session ? <Match key={session.user.id} userId={session.user.id} /> : null
}

function Match({ userId }: { userId: string }) {
  const [filters, setFilters] = useState<DiscoveryFilters>()
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [filterSession, setFilterSession] = useState<{ key: number; filters: DiscoveryFilters }>()
  const load = useCallback(
    (signal: AbortSignal) => filters ? getDiscoveryFeed(filters, signal) : Promise.resolve(undefined),
    [filters],
  )
  const { data, setData, error, retry } = useDiscoveryQuery(load)
  const [restarting, setRestarting] = useState(false)
  const [restartError, setRestartError] = useState(false)
  const filtersActive = !!(filters?.sizes.length || filters?.ages.length || filters?.sex || filters?.radiusKm)
  const locationMissing = error instanceof Error && error.cause === 409

  useEffect(() => {
    let active = true
    async function initializeFilters() {
      const saved = await readMatchPreferences(userId)
      if (!active) return
      if (saved) {
        setFilters(saved)
        return
      }

      let initial = DEFAULT_DISCOVERY_FILTERS
      try {
        const position = await getMatchPosition()
        if (!active) return
        await saveDiscoveryLocation(position)
        initial = { ...initial, nearby: true }
      } catch {
        // Un refus ou une position indisponible laisse la découverte sans rayon.
      }
      if (!active) return
      setFilters(initial)
      void saveMatchPreferences(userId, initial).catch(() => {})
    }

    void initializeFilters()
    return () => { active = false }
  }, [userId])

  function openFilters() {
    if (!filters) return
    setFilterSession((current) => ({ key: (current?.key ?? 0) + 1, filters }))
    setFiltersVisible(true)
  }

  async function applyFilters(next: DiscoveryFilters, position?: Coordinates) {
    if (position) await saveDiscoveryLocation(position)
    await saveMatchPreferences(userId, next)
    setFilters(next)
    setRestartError(false)
    setFiltersVisible(false)
    retry()
  }

  async function restart() {
    setRestarting(true)
    setRestartError(false)
    try {
      await restartDiscovery()
      retry()
    } catch (failure) {
      if (failure instanceof Error && failure.cause === 409) retry()
      else setRestartError(true)
    } finally {
      setRestarting(false)
    }
  }

  return (
    <TabPage
      title="Découvrir"
      scroll={false}
      header={<MatchHeader disabled={!filters} onFilters={openFilters} />}
    >
      {insets => (
        <View style={styles.content}>
          {data?.dogs.length ? (
            <SwipeDeck dogs={data.dogs} insets={insets} onComplete={() => {
              if (data.dogs.length === 1) retry()
              else setData({ ...data, dogs: data.dogs.slice(1) })
            }} />
          ) : (
            <View style={[
              styles.state,
              { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
            ]}>
              {error ? (
                <>
                  <Text style={styles.message} accessibilityRole="alert">
                    {locationMissing ? 'Ta position n’est plus disponible.' : 'Impossible de charger les chiens.'}
                  </Text>
                  {locationMissing ? (
                    <Button variant="secondary" onPress={openFilters}>Ajuster les filtres</Button>
                  ) : (
                    <Button variant="secondary" onPress={retry}>Réessayer</Button>
                  )}
                </>
              ) : data ? (
                <>
                  <Text style={styles.message}>
                    {data.canRestart
                      ? 'Tu as vu tous les chiens !'
                      : filtersActive
                        ? 'Aucun chien ne correspond à tes filtres. Essaie de les élargir.'
                        : 'Aucun chien à découvrir pour le moment.'}
                  </Text>
                  {restartError && <Text accessibilityRole="alert">Impossible de recommencer. Réessaie.</Text>}
                  {data.canRestart ? (
                    <View style={styles.restartFrame}>
                      {!restarting && <View pointerEvents="none" style={styles.restartShadow} />}
                      <Button onPress={restart} loading={restarting} style={styles.restartButton}>
                        Recommencer
                      </Button>
                    </View>
                  ) : filtersActive ? (
                    <Button variant="secondary" onPress={openFilters}>Élargir les filtres</Button>
                  ) : (
                    <Button variant="secondary" onPress={retry}>Actualiser</Button>
                  )}
                </>
              ) : (
                <ActivityIndicator color={colors.active} accessibilityLabel="Chargement des chiens" />
              )}
            </View>
          )}
          {filterSession && (
            <MatchFiltersSheet
              key={filterSession.key}
              visible={filtersVisible}
              initialFilters={filterSession.filters}
              onClose={() => setFiltersVisible(false)}
              onApply={applyFilters}
            />
          )}
        </View>
      )}
    </TabPage>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  state: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
  },
  restartFrame: {
    width: '100%',
    maxWidth: 280 + RESTART_SHADOW_OFFSET,
    paddingRight: RESTART_SHADOW_OFFSET,
    paddingBottom: RESTART_SHADOW_OFFSET,
  },
  restartShadow: {
    ...StyleSheet.absoluteFill,
    left: RESTART_SHADOW_OFFSET,
    top: RESTART_SHADOW_OFFSET,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
  },
  restartButton: {
    minHeight: 58,
    height: 'auto',
    paddingVertical: spacing[3],
    boxShadow: 'none',
  },
  message: { ...typography.bodyStrong, color: colors.text, textAlign: 'center' },
})
