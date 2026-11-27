import { SwipeActions } from '@/components/ui'
import { MATCH_CARD_RADIUS, MatchCard } from '@/components/ui/match-card'
import { formatDiscoveryDistance, sendSwipe } from '@/features/discovery/api'
import { consumeSwipeIntent, type SwipeDirection } from '@/features/discovery/swipe-intent'
import { colors, spacing } from '@/theme'
import type { DiscoveryDog, NewDogMatch } from '@shared/discovery'
import { BlurTargetView, BlurView } from 'expo-blur'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState, type ComponentRef } from 'react'
import {
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated'
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets'
import { useMatchCelebration } from './match-celebration'
const SWIPE_THRESHOLD = 120
const EXIT_DURATION = 220
const REVEAL_DURATION = 160
const BLUR_INTENSITY = 10
const MAX_CARD_WIDTH = 400
const CARD_SHADOW_OFFSET = 6

type SwipeDeckProps = {
  dogs: DiscoveryDog[]
  insets: { top: number; bottom: number }
  onComplete: () => void
}

type SwipeCardRoundProps = Pick<SwipeDeckProps, 'insets' | 'onComplete'> & {
  dog: DiscoveryDog
  active: boolean
  nextDogId?: string
  revealedDogId: SharedValue<string | undefined>
  width: number
}

function SwipeCardRound({
  dog,
  active,
  nextDogId,
  revealedDogId,
  width,
  insets,
  onComplete,
}: SwipeCardRoundProps) {
  const dogId = dog.id
  const celebrate = useMatchCelebration()
  const distance = formatDiscoveryDistance(dog.distanceKm, dog.distanceApproximate)
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const isSwiping = useSharedValue(false)
  const blurOpacity = useSharedValue(active ? 0 : 1)
  const scale = useSharedValue(active ? 1 : 0.95)
  const saving = useSharedValue(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  useAnimatedReaction(
    () => active || revealedDogId.get() === dogId,
    (revealed, previous) => {
      if (revealed && !previous) {
        blurOpacity.set(withTiming(0, { duration: REVEAL_DURATION }))
        scale.set(withTiming(1, { duration: EXIT_DURATION }))
      }
    },
  )

  const triggerSwipe = useCallback((
    direction: SwipeDirection,
    targetY = 0,
    newMatches: NewDogMatch[] = [],
  ) => {
    'worklet'

    if (isSwiping.get()) return

    isSwiping.set(true)
    revealedDogId.set(nextDogId)
    const exitX = direction * (width + MAX_CARD_WIDTH)

    translateX.set(withTiming(
      exitX,
      { duration: EXIT_DURATION },
      (finished) => {
        if (finished) {
          scheduleOnRN(onComplete)
          if (newMatches.length) scheduleOnRN(celebrate, newMatches)
        }
      },
    ))

    translateY.set(withTiming(
      targetY,
      { duration: EXIT_DURATION },
    ))
  }, [celebrate, isSwiping, nextDogId, onComplete, revealedDogId, translateX, translateY, width])

  async function saveSwipe(direction: SwipeDirection, targetY = 0) {
    if (saving.get()) return
    saving.set(true)
    setPending(true)
    setError(false)
    try {
      const result = await sendSwipe(dogId, direction === 1 ? 'like' : 'dislike')
      const newMatches = result.matches.map((match) => ({ ...match, targetDogPhoto: match.targetDogPhoto ?? dog.photo }))
      scheduleOnUI(triggerSwipe, direction, targetY, newMatches)
    } catch {
      saving.set(false)
      setPending(false)
      setError(true)
      translateX.set(withSpring(0))
      translateY.set(withSpring(0))
    }
  }

  // Geste tactile
  const panGesture = Gesture.Pan()
    .enabled(active)
    .onUpdate((event) => {
      if (isSwiping.get() || pending) return

      translateX.set(event.translationX)
      translateY.set(event.translationY)
    })
    .onEnd((event) => {
      if (isSwiping.get() || pending) return

      if (event.translationX > SWIPE_THRESHOLD) {
        scheduleOnRN(saveSwipe, 1, event.translationY)
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        scheduleOnRN(saveSwipe, -1, event.translationY)
      } else {
        translateX.set(withSpring(0, {
          damping: 128,
          stiffness: 128,
        }))

        translateY.set(withSpring(0, {
          damping: 128,
          stiffness: 128,
        }))
      }
    })

  // Style animé de la carte principale
  const animatedCardStyle = useAnimatedStyle(() => {
    const x = translateX.get()
    const rotation = interpolate(
      x,
      [-200, 0, 200],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    )

    return {
      transform: [
        { translateX: x },
        { translateY: translateY.get() },
        { rotate: `${rotation}deg` },
        { scale: scale.get() },
      ],
    }
  })

  const animatedBlurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.get(),
  }))

  // Choix fait depuis la page de détail : on l'anime au retour sur l'écran de match
  useFocusEffect(
    useCallback(() => {
      if (!active) return
      const intent = consumeSwipeIntent(dogId)
      if (intent) {
        saving.set(true)
        setPending(true)
        scheduleOnUI(triggerSwipe, intent.direction, 0, intent.matches)
      }
    }, [active, dogId, saving, setPending, triggerSwipe]),
  )

  return (
    <View
      style={[
        styles.round,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing[2] },
        active && styles.frontCard,
      ]}
      pointerEvents={active ? 'box-none' : 'none'}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardLayer, animatedCardStyle]}>
          <View pointerEvents="none" style={styles.cardShadow} />
          <BlurTargetView ref={blurTargetRef} style={styles.cardFace}>
            <MatchCard
              name={dog.name}
              photoUri={dog.photo}
              age={dog.age ?? undefined}
              breed={dog.breed ?? undefined}
              distance={distance === undefined ? undefined : `à ${distance}`}
              favoriteToy={dog.favoriteToy ?? undefined}
              style={styles.matchCard}
            />
          </BlurTargetView>
          {!active && (
            <Animated.View style={[styles.blurOverlay, animatedBlurStyle]} pointerEvents="none">
              <BlurView
                blurTarget={blurTargetRef}
                blurMethod="dimezisBlurView"
                blurReductionFactor={2}
                intensity={BLUR_INTENSITY}
                tint="default"
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Boutons : Passer, Voir tout son profil, J'aime */}
      <SwipeActions
        dogName={dog.name}
        onPass={() => { void saveSwipe(-1) }}
        onLike={() => { void saveSwipe(1) }}
        onDetails={() => router.push({
          pathname: '/dog/[id]',
          params: { id: dog.id, nearby: distance === undefined ? undefined : '1' },
        })}
        disabled={!active || pending}
        style={[styles.actions, !active && styles.hidden]}
      />
      {error && <Text accessibilityRole="alert">Choix non enregistré. Réessaie.</Text>}
    </View>
  )
}

export function SwipeDeck({ dogs, insets, onComplete }: SwipeDeckProps) {
  const { width } = useWindowDimensions()
  const revealedDogId = useSharedValue<string | undefined>(undefined)

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* La clé conserve la vue native et sa photo quand la carte passe devant. */}
      {dogs.slice(0, 2).map((dog, index) => (
        <SwipeCardRound
          key={dog.id}
          dog={dog}
          active={index === 0}
          nextDogId={index === 0 ? dogs[1]?.id : undefined}
          revealedDogId={revealedDogId}
          width={width}
          insets={insets}
          onComplete={onComplete}
        />
      ))}
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'visible',
  },

  round: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: spacing[4],
    overflow: 'visible',
  },

  cardFace: {
    flex: 1,
  },

  matchCard: {
    flex: 1,
    boxShadow: 'none',
  },

  cardLayer: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CARD_WIDTH,
    paddingRight: CARD_SHADOW_OFFSET,
    paddingBottom: CARD_SHADOW_OFFSET,
    overflow: 'visible',
  },

  cardShadow: {
    ...StyleSheet.absoluteFill,
    left: CARD_SHADOW_OFFSET,
    top: CARD_SHADOW_OFFSET,
    backgroundColor: colors.border,
    borderRadius: MATCH_CARD_RADIUS,
  },

  frontCard: {
    zIndex: 1,
  },

  blurOverlay: {
    ...StyleSheet.absoluteFill,
    right: CARD_SHADOW_OFFSET,
    bottom: CARD_SHADOW_OFFSET,
    borderRadius: MATCH_CARD_RADIUS,
    overflow: 'hidden',
  },

  actions: {
    marginTop: 8,
    zIndex: 1,
  },
  hidden: {
    opacity: 0,
  },
})
