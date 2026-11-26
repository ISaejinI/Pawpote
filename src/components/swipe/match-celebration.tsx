import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withTiming,
} from 'react-native-reanimated'

import LeftPaw from '@/assets/icons/match-paw-left.svg'
import RightPaw from '@/assets/icons/match-paw-right.svg'
import Spark from '@/assets/icons/match-spark.svg'
import { Avatar, Icon } from '@/components/ui'
import { borderWidth, colors, radius, shadows, spacing, typography } from '@/theme'
import type { NewDogMatch } from '../../../shared/discovery'

const DISPLAY_MS = 3_000
const ART_SIZE = 68
const MatchCelebrationContext = createContext<((matches: NewDogMatch[]) => void) | null>(null)

export function MatchCelebrationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<NewDogMatch[]>([])
  const celebrate = useCallback((matches: NewDogMatch[]) => {
    if (matches.length === 0) return
    setQueue((current) => [...current, ...matches.filter((match) => !current.some(({ id }) => id === match.id))])
  }, [])
  const dismiss = useCallback(() => setQueue((current) => current.slice(1)), [])
  const current = queue[0]

  return (
    <MatchCelebrationContext value={celebrate}>
      {children}
      <Modal visible={!!current} transparent animationType="fade" onRequestClose={dismiss} statusBarTranslucent>
        {current && <MatchCelebration key={current.id} match={current} onClose={dismiss} />}
      </Modal>
    </MatchCelebrationContext>
  )
}

export function useMatchCelebration() {
  const celebrate = use(MatchCelebrationContext)
  if (!celebrate) throw new Error('MatchCelebrationProvider is required')
  return celebrate
}

function MatchCelebration({ match, onClose }: { match: NewDogMatch; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <View style={styles.screen}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button"
        accessibilityLabel="Fermer la notification de match" onPress={onClose} />
      <View style={styles.card} accessibilityViewIsModal>
        <Text style={styles.title} accessibilityLiveRegion="polite" accessibilityRole="header">
          C’est un match !
        </Text>
        <View style={styles.portraits}>
          <DogPortrait name={match.ownDog} photo={match.ownDogPhoto} color={colors.lavender200} />
          <PawHighFive />
          <DogPortrait name={match.targetDog} photo={match.targetDogPhoto} color={colors.pink300} />
        </View>
        <Text style={styles.subtitle}>Une nouvelle balade en vue !</Text>
      </View>
    </View>
  )
}

function DogPortrait({ name, photo, color }: { name: string; photo?: string | null; color: string }) {
  return (
    <View style={styles.portrait}>
      <Avatar uri={photo} size={66} raised fallbackIcon="paw" color={color} accessibilityLabel={`Photo de ${name}`} />
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
    </View>
  )
}

function PawHighFive() {
  const reducedMotion = useReducedMotion()
  const distance = useSharedValue(1)
  const sparkle = useSharedValue(0)

  useEffect(() => {
    if (reducedMotion) return
    distance.set(withSequence(
      withTiming(-0.32, { duration: 320, easing: Easing.in(Easing.quad) }),
      withTiming(0.22, { duration: 100 }),
      withTiming(0, { duration: 160, easing: Easing.out(Easing.quad) }),
    ))
    sparkle.set(withDelay(280, withSequence(
      withTiming(1, { duration: 130 }),
      withTiming(0.82, { duration: 210 }),
    )))
  }, [distance, sparkle, reducedMotion])

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -distance.get() * 14 }, { rotate: `${distance.get() * -12}deg` }],
  }))
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: distance.get() * 14 }, { rotate: `${distance.get() * 12}deg` }],
  }))
  const sparkStyle = useAnimatedStyle(() => ({
    opacity: sparkle.get(),
    transform: [{ scale: 0.65 + sparkle.get() * 0.55 }],
  }))

  return (
    <View style={styles.animation} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      {reducedMotion ? <Icon name="tab-match" size={ART_SIZE} /> : (
        <>
          <Animated.View style={[StyleSheet.absoluteFill, sparkStyle]}><Spark width={ART_SIZE} height={ART_SIZE} /></Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, rightStyle]}><RightPaw width={ART_SIZE} height={ART_SIZE} /></Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, leftStyle]}><LeftPaw width={ART_SIZE} height={ART_SIZE} /></Animated.View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[5],
    backgroundColor: 'rgba(30,18,64,0.48)',
  },
  card: {
    width: '100%', maxWidth: 330, alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[5],
    backgroundColor: colors.surface, borderWidth: borderWidth.regular,
    borderColor: colors.border, borderRadius: radius.xl, ...shadows.lg,
  },
  title: { ...typography.titleLg, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.handLg, color: colors.text, textAlign: 'center' },
  portraits: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  portrait: { flex: 1, minWidth: 0, alignItems: 'center', gap: spacing[2] },
  name: { ...typography.bodyStrong, color: colors.text, textAlign: 'center' },
  animation: { width: ART_SIZE, height: ART_SIZE, marginTop: 2 },
})
