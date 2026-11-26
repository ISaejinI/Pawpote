import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { SwipeDeck } from '@/components/swipe/swipe-deck'
import { Button, TabPage } from '@/components/ui'
import { getDiscoveryFeed, restartDiscovery } from '@/lib/discovery-api'
import { useDiscoveryQuery } from '@/lib/use-discovery-query'
import { colors, radius, spacing, typography } from '@/theme'

const RESTART_SHADOW_OFFSET = 4

export default function MatchScreen() {
  const { data, setData, error, retry } = useDiscoveryQuery(getDiscoveryFeed)
  const [restarting, setRestarting] = useState(false)
  const [restartError, setRestartError] = useState(false)

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
    <TabPage title="Découvrir" scroll={false}>
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
                  <Text style={styles.message} accessibilityRole="alert">Impossible de charger les chiens.</Text>
                  <Button variant="secondary" onPress={retry}>Réessayer</Button>
                </>
              ) : data ? (
                <>
                  <Text style={styles.message}>
                    {data.canRestart ? 'Tu as vu tous les chiens !' : 'Aucun chien à découvrir pour le moment.'}
                  </Text>
                  {restartError && <Text accessibilityRole="alert">Impossible de recommencer. Réessaie.</Text>}
                  {data.canRestart ? (
                    <View style={styles.restartFrame}>
                      {!restarting && <View pointerEvents="none" style={styles.restartShadow} />}
                      <Button onPress={restart} loading={restarting} style={styles.restartButton}>
                        Recommencer
                      </Button>
                    </View>
                  ) : (
                    <Button variant="secondary" onPress={retry}>Actualiser</Button>
                  )}
                </>
              ) : (
                <ActivityIndicator color={colors.active} accessibilityLabel="Chargement des chiens" />
              )}
            </View>
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
