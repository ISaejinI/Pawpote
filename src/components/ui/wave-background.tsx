import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Fond des écrans : lavande avec le motif de vagues `lavender-300`.
 * Se place en premier enfant d'un écran ; le contenu passe par-dessus.
 */
export function WaveBackground() {
  return (
    <View style={styles.root} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke={colors.backgroundPattern}
        strokeWidth={15}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M-20 70 C30 20 100 120 160 70 S270 0 310 60 S390 140 420 90" />
        <Path d="M40 230 C0 170 110 150 130 210 C150 270 230 240 220 310 C210 380 110 360 100 320 C90 280 80 290 40 230 Z" />
        <Path d="M270 200 C330 160 430 210 390 280 C350 350 420 400 370 450 C330 490 280 440 300 390 C320 340 240 280 270 200 Z" />
        <Path d="M-30 520 C30 480 70 560 40 610 S90 700 150 670 S220 580 200 540" />
        <Path d="M240 600 C290 560 370 590 350 660 C330 730 410 750 430 720" />
        <Path d="M-20 770 C40 730 110 810 160 790 S240 870 300 840" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
});
