import { DogCard } from '@/components/swipe/dog-card'
import { IconButton } from '@/components/ui'
import type { MockDog } from '@/data/mock-dogs'
import { BlurTargetView, BlurView } from 'expo-blur'
import { useRef, useState, type ComponentRef } from 'react'
import {
    Pressable,
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
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
// Réglages actuels
const SWIPE_THRESHOLD = 120
const EXIT_DURATION = 220
const REVEAL_DURATION = 160
const BLUR_INTENSITY = 10

type SwipeDirection = -1 | 1

type SwipeDeckProps = {
  dogs: MockDog[]
}

type NextDogCardProps = {
  dog: MockDog
  blurOpacity: SharedValue<number>
  scale: SharedValue<number>
}

// ==========================================
// CARTE ARRIÈRE
// ==========================================

function NextDogCard({
  dog,
  blurOpacity,
  scale,
}: NextDogCardProps) {
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null)

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const animatedBlurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.cardLayer,
        styles.backCard,
        animatedScaleStyle,
      ]}
      pointerEvents="none"
    >
      <BlurTargetView
        ref={blurTargetRef}
        style={styles.blurTarget}
      >
        <DogCard dog={dog} />
      </BlurTargetView>

      <Animated.View
        style={[
          styles.blurOverlay,
          animatedBlurStyle,
        ]}
        pointerEvents="none"
      >
        <BlurView
          blurTarget={blurTargetRef}
          blurMethod="dimezisBlurView"
          blurReductionFactor={2}
          intensity={BLUR_INTENSITY}
          tint="default"
          style={styles.blurFill}
        />
      </Animated.View>
    </Animated.View>
  )
}

// ==========================================
// UNE SESSION DE SWIPE
// ==========================================

type SwipeCardRoundProps = {
  dog: MockDog
  nextDog?: MockDog
  width: number
  onComplete: () => void
}

function SwipeCardRound({
  dog,
  nextDog,
  width,
  onComplete,
}: SwipeCardRoundProps) {
  // Ces valeurs appartiennent uniquement
  // au chien actuel
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  const isSwiping = useSharedValue(false)
  const blurOpacity = useSharedValue(1)
  const backScale = useSharedValue(0.95)

  // Animation commune aux boutons et aux gestes
  function triggerSwipe(
    direction: SwipeDirection,
    targetY = 0,
  ) {
    'worklet'

    if (isSwiping.value) return

    isSwiping.value = true

    // La prochaine carte se défloute
    blurOpacity.value = withTiming(0, {
      duration: REVEAL_DURATION,
    })

    // Elle reprend sa taille normale
    backScale.value = withTiming(1, {
      duration: EXIT_DURATION,
    })

    // La carte actuelle sort de l'écran
    const exitX = direction * (width + 400)

    translateX.value = withTiming(
      exitX,
      { duration: EXIT_DURATION },
      (finished) => {
        if (finished) {
          scheduleOnRN(onComplete)
        }
      },
    )

    translateY.value = withTiming(
      targetY,
      { duration: EXIT_DURATION },
    )
  }

  // Geste tactile
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isSwiping.value) return

      translateX.value = event.translationX
      translateY.value = event.translationY
    })
    .onEnd((event) => {
      if (isSwiping.value) return

      if (event.translationX > SWIPE_THRESHOLD) {
        triggerSwipe(1, event.translationY)
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        triggerSwipe(-1, event.translationY)
      } else {
        translateX.value = withSpring(0, {
          damping: 128,
          stiffness: 128,
        })

        translateY.value = withSpring(0, {
          damping: 128,
          stiffness: 128,
        })
      }
    })

  // Style animé de la carte principale
  const animatedCardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-200, 0, 200],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    )

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    }
  })

  return (
    <View style={styles.round}>
      <View style={styles.cardContainer}>
        {/* Prochain chien, flouté */}
        {nextDog && (
          <NextDogCard
            dog={nextDog}
            blurOpacity={blurOpacity}
            scale={backScale}
          />
        )}

        {/* Chien actuel */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.cardLayer,
              styles.frontCard,
              animatedCardStyle,
            ]}
          >
            <DogCard dog={dog} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Boutons */}
      <View style={styles.actions}>
        <IconButton
          icon="close"
          variant="pass"
          size="lg"
          onPress={() => triggerSwipe(-1)}
          accessibilityLabel="Passer ce chien"
        />

        <IconButton
          icon="heart"
          variant="like"
          size="lg"
          onPress={() => triggerSwipe(1)}
          accessibilityLabel="Liker ce chien"
        />
      </View>

      <Text style={styles.hint}>
        Glisse à gauche ou à droite
      </Text>
    </View>
  )
}

// ==========================================
// COMPOSANT RÉUTILISABLE
// ==========================================

export function SwipeDeck({ dogs }: SwipeDeckProps) {
  const { width } = useWindowDimensions()

  const [currentIndex, setCurrentIndex] = useState(0)

  const currentDog = dogs[currentIndex]
  const nextDog = dogs[currentIndex + 1]

  function showNextDog() {
    setCurrentIndex((index) => index + 1)
  }

  function restart() {
    setCurrentIndex(0)
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.content}>
        {currentDog ? (
          <SwipeCardRound
            key={currentDog.id}
            dog={currentDog}
            nextDog={nextDog}
            width={width}
            onComplete={showNextDog}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              Plus de chiens à découvrir ! 🐾
            </Text>

            <Pressable
              onPress={restart}
              accessibilityRole="button"
              accessibilityLabel="Recommencer les swipes"
            >
              <Text style={styles.resetButton}>
                Recommencer
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  )
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },

  round: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },

  cardContainer: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 1,
    position: 'relative',
  },

  cardLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },

  backCard: {
    zIndex: 0,
  },

  frontCard: {
    zIndex: 1,
  },

  blurTarget: {
    width: '100%',
    height: '100%',
  },

  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },

  blurFill: {
    width: '100%',
    height: '100%',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48, // écart Passer / J'aime défini par le design system
    marginTop: 8,
  },

  hint: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
  },

  emptyState: {
    alignItems: 'center',
    gap: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#202020',
    textAlign: 'center',
  },

  resetButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#208AEF',
  },
})