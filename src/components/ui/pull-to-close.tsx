import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export type PullToCloseProps = {
  /** Appelé une fois la page sortie de l'écran (ex. `router.back`). */
  onClose: () => void;
  /** Contenu qui défile. */
  children: ReactNode;
  /** Élément fixé par-dessus le contenu (ex. barre d'actions en bas), qui suit le geste. */
  overlay?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

/** Distance ou vitesse de glissement vers le bas qui ferme la page. */
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 900;
const CLOSE_DURATION = 220;
/** Arrondi des coins du haut pendant le glissement, comme une carte qu'on repose. */
const DRAG_RADIUS = 30;

/**
 * Page qui défile et se ferme quand on la tire vers le bas depuis tout en haut.
 * Le geste ne s'active qu'au sommet : plus bas, on fait simplement défiler le contenu.
 */
export function PullToClose({
  onClose,
  children,
  overlay,
  contentContainerStyle,
  style,
}: PullToCloseProps) {
  const { height } = useWindowDimensions();

  const scrollY = useSharedValue(0);
  const dragY = useSharedValue(0);
  const startedAtTop = useSharedValue(false);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Le défilement et le glissement fonctionnent ensemble
  const scrollGesture = Gesture.Native();
  const pullGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    // Laisse passer les glissements horizontaux (carrousel de photos)
    .failOffsetX([-15, 15])
    .simultaneousWithExternalGesture(scrollGesture)
    .onStart(() => {
      startedAtTop.value = scrollY.value <= 0;
    })
    .onUpdate((event) => {
      dragY.value = startedAtTop.value && scrollY.value <= 0 ? Math.max(0, event.translationY) : 0;
    })
    .onEnd((event) => {
      const shouldClose =
        dragY.value > CLOSE_DISTANCE || (dragY.value > 0 && event.velocityY > CLOSE_VELOCITY);

      if (shouldClose) {
        dragY.value = withTiming(height, { duration: CLOSE_DURATION }, (finished) => {
          if (finished) scheduleOnRN(onClose);
        });
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const pageStyle = useAnimatedStyle(() => {
    const radius = Math.min(DRAG_RADIUS, dragY.value / 3);
    return {
      transform: [{ translateY: dragY.value }],
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
    };
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={pullGesture}>
        <Animated.View style={[styles.page, style, pageStyle]}>
          <GestureDetector gesture={scrollGesture}>
            <Animated.ScrollView
              onScroll={onScroll}
              scrollEventThrottle={16}
              // Pas de rebond en haut : c'est la page entière qui descend
              bounces={false}
              overScrollMode="never"
              contentContainerStyle={contentContainerStyle}
            >
              {children}
            </Animated.ScrollView>
          </GestureDetector>

          {overlay}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  page: {
    flex: 1,
    overflow: 'hidden',
  },
});
