import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, typography } from '@/theme';

import { Icon } from '../base/icon';

/** Un saut dure 1,2 s : montée, descente, puis une pause pied à terre. */
const HOP_HEIGHT = 10;
const HOP_UP = 360;
const HOP_DOWN = 360;
const HOP_REST = 480;
/** Décalage entre deux pattes : elles sautent l'une après l'autre. */
const STAGGER = 200;
const PAW_COUNT = 3;

export type PawLoaderProps = {
  /** Texte sous les pattes, lu par les lecteurs d'écran. */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/** Attente : trois pattes qui sautent à tour de rôle, au-dessus d'un court message. */
export function PawLoader({ label = 'On sort la laisse…', style }: PawLoaderProps) {
  return (
    <View style={[styles.root, style]} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View style={styles.paws} importantForAccessibility="no-hide-descendants">
        {Array.from({ length: PAW_COUNT }, (_, index) => (
          <HoppingPaw key={index} delay={index * STAGGER} />
        ))}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function HoppingPaw({ delay }: { delay: number }) {
  const reducedMotion = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    // Mouvement réduit : les pattes restent immobiles, le message suffit
    if (reducedMotion) return;
    const ease = Easing.inOut(Easing.quad);
    offset.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-HOP_HEIGHT, { duration: HOP_UP, easing: ease }),
            withTiming(0, { duration: HOP_DOWN, easing: ease }),
            withTiming(0, { duration: HOP_REST }),
          ),
          -1,
        ),
      ),
    );
  }, [delay, offset, reducedMotion]);

  const hopStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.get() }] }));

  return (
    <Animated.View style={hopStyle}>
      <Icon name="paw" size={26} color={colors.text} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 10,
  },
  paws: {
    flexDirection: 'row',
    gap: 14,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
});
