import { Image } from 'expo-image';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, palette, typography } from '@/theme';

import { Logo } from '../base/logo';
import { PawLoader } from '../feedback/paw-loader';

/** Format de la maquette : la composition y est placée au pixel près, puis mise à l'échelle. */
const STAGE_WIDTH = 390;
const STAGE_HEIGHT = 844;

const BLOB = 'M40 70 C70 15 205 20 272 78 C322 120 312 215 252 268 C202 312 118 318 78 276 C28 226 8 122 40 70 Z';

const dog = require('@/assets/images/loader-dog.webp');
const DOG_WIDTH = 320;
const DOG_HEIGHT = Math.round((DOG_WIDTH * 1313) / 1065);

export type LoadingPageProps = {
  /** Message sous les pattes. */
  label?: string;
};

/**
 * Écran de chargement de l'app (maquette « Chargement, style B ») : le chien sur sa tache
 * orange, le logo, l'accroche et les pattes qui sautent en attendant.
 */
export function LoadingPage({ label }: LoadingPageProps) {
  const { width, height } = useWindowDimensions();
  // Toute la composition reste visible, quel que soit le format de l'écran
  const scale = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
  // Sur un écran plus large que la maquette, la composition laisse une marge de chaque côté :
  // le chien, coupé à droite dans l'image, est recollé au bord droit de l'écran
  const sideGap = (width - STAGE_WIDTH * scale) / 2;

  return (
    <View style={styles.root}>
      <Waves />

      <View
        style={[
          styles.stage,
          {
            left: (width - STAGE_WIDTH) / 2,
            top: (height - STAGE_HEIGHT) / 2,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[StyleSheet.absoluteFill, { transform: [{ translateX: sideGap / scale }] }]}>
          <Svg width={320} height={330} viewBox="0 0 320 330" style={styles.blob}>
            <Path d={BLOB} transform="translate(7 7)" fill={colors.shadow} />
            <Path d={BLOB} fill={palette.mandarin600} stroke={colors.border} strokeWidth={3} />
          </Svg>

          <Squiggles />

          <Image source={dog} contentFit="contain" style={styles.dog} accessible={false} />
        </View>

        <View style={styles.brand}>
          <Logo variant="inline" width={320} />
          <View style={styles.tagline}>
            <Text style={styles.taglineText}>Des copains de balade pour ton chien</Text>
          </View>
        </View>

        <PawLoader label={label} style={styles.loader} />
      </View>
    </View>
  );
}

/** Motif de vagues de la maquette, étiré pour couvrir tout l'écran. */
function Waves() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke={colors.backgroundPattern}
      strokeWidth={15}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={StyleSheet.absoluteFill}
    >
      <Path d="M-20 70 C30 20 100 120 160 70 S270 0 310 60 S390 140 420 90" />
      <Path d="M-30 520 C30 480 70 560 40 610 S90 700 150 670 S220 580 200 540" />
      <Path d="M240 600 C290 560 370 590 350 660 C330 730 410 750 430 720" />
      <Path d="M-20 770 C40 730 110 810 160 790 S240 870 300 840" />
      <Path d="M300 760 C330 720 400 760 420 800" />
    </Svg>
  );
}

/** Petits traits et ronds colorés autour du chien. */
function Squiggles() {
  return (
    <Svg
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
      fill="none"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={StyleSheet.absoluteFill}
    >
      <Path d="M300 78 C318 92 296 112 312 128 C326 142 306 160 314 172" stroke={palette.orange500} />
      <Path d="M120 112 C134 104 144 118 136 130 C128 142 140 154 156 150" stroke={palette.pink500} />
      <Circle cx={64} cy={150} r={11} stroke={palette.lime500} />
      <Path d="M18 300 C30 288 40 304 52 294 C64 284 72 298 82 290" stroke={palette.lime500} />
      <Path d="M340 402 C356 398 372 412 366 428 C360 444 374 456 384 452" stroke={palette.orange500} />
      <Path d="M54 478 C46 494 64 500 58 516 C52 530 66 540 78 534" stroke={palette.pink500} />
      <Circle cx={292} cy={500} r={10} stroke={palette.pink500} />
      <Path d="M210 510 C222 500 234 514 246 506" stroke={palette.lime500} />
      <Circle cx={348} cy={250} r={7} stroke={palette.lime500} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stage: {
    position: 'absolute',
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  },
  blob: {
    position: 'absolute',
    left: 35,
    top: 150,
  },
  dog: {
    position: 'absolute',
    right: 0,
    top: 108,
    width: DOG_WIDTH,
    height: DOG_HEIGHT,
  },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 522,
    alignItems: 'center',
    gap: 14,
  },
  tagline: {
    backgroundColor: palette.lime500,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 999,
    // Contour ink autour du contour blanc, comme les stickers
    boxShadow: `0 0 0 2px ${palette.ink}`,
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 16,
    transform: [{ rotate: '2deg' }],
  },
  taglineText: {
    ...typography.handLg,
    color: colors.text,
  },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
  },
});
