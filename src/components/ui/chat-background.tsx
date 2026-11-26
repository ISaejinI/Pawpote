import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, Use } from 'react-native-svg';

import { colors } from '@/theme';

/** Trait des têtes de chiens : un cran plus clair que le motif de vagues. */
const DOODLE_COLOR = '#C4B4FF';

/** Le motif est dessiné pour 390 px de large et se répète tous les 600 px de haut. */
const PATTERN_WIDTH = 390;
const PATTERN_HEIGHT = 600;

/** Position de chaque tête : [dessin, x, y, rotation]. */
const PLACEMENTS: [string, number, number, number][] = [
  ['d1', 8, 4, -10],
  ['d3', 150, 0, 8],
  ['d2', 286, 10, 12],
  ['d4', 70, 120, 6],
  ['d5', 214, 118, -8],
  ['d2', -10, 238, -14],
  ['d1', 130, 246, 10],
  ['d3', 262, 240, -6],
  ['d5', 48, 362, 4],
  ['d4', 190, 360, -12],
  ['d1', 300, 372, 14],
  ['d3', -6, 480, 10],
  ['d2', 120, 486, -6],
  ['d4', 252, 486, 8],
];

/**
 * Fond des conversations : cream avec des têtes de chiens dessinées au trait.
 * Se place en premier enfant de la zone des messages ; le contenu passe par-dessus.
 */
export function ChatBackground() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Le motif garde ses proportions : on ajoute des répétitions pour couvrir toute la hauteur
  const scale = size.width / PATTERN_WIDTH || 1;
  const viewHeight = size.height / scale;
  const repeats = Math.ceil(viewHeight / PATTERN_HEIGHT);

  return (
    <View
      style={styles.root}
      pointerEvents="none"
      onLayout={({ nativeEvent }) =>
        setSize({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })
      }
    >
      {size.width > 0 && (
        <Svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${PATTERN_WIDTH} ${viewHeight}`}
          fill="none"
          stroke={DOODLE_COLOR}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Defs>
            <G id="d1">
              <Path d="M22 22 C10 20 6 40 14 50 C20 46 24 36 26 28 Z" fill={DOODLE_COLOR} />
              <Path d="M58 22 C70 20 74 40 66 50 C60 46 56 36 54 28 Z" fill={DOODLE_COLOR} />
              <Path d="M40 16 C56 16 62 28 62 42 C62 58 52 66 40 66 C28 66 18 58 18 42 C18 28 24 16 40 16 Z" />
              <Path d="M32 37 v4 M48 37 v4" />
              <Ellipse cx="40" cy="50" rx="5" ry="3.5" fill={DOODLE_COLOR} />
              <Path d="M40 54 v3 M34 58 C37 61 43 61 46 58" />
            </G>
            <G id="d2">
              <Path d="M18 66 C14 50 16 36 20 26 L18 8 L32 20 C37 18 43 18 48 20 L62 8 L60 26 C64 36 66 50 62 66 Z" />
              <Circle cx="31" cy="40" r="4" />
              <Circle cx="49" cy="40" r="4" />
              <Circle cx="49" cy="40" r="1.5" fill={DOODLE_COLOR} />
              <Path d="M36 52 h8 l-4 5 z" fill={DOODLE_COLOR} />
              <Circle cx="56" cy="58" r="4" fill={DOODLE_COLOR} />
              <Path d="M24 30 v4" />
            </G>
            <G id="d3">
              <Path d="M14 30 C14 18 26 12 38 14 L66 34 C72 38 70 46 64 46 L40 50 C28 54 16 48 14 30 Z" />
              <Path d="M20 20 C14 8 30 4 34 15 Z" fill={DOODLE_COLOR} />
              <Circle cx="36" cy="29" r="3.5" fill={DOODLE_COLOR} />
              <Circle cx="66" cy="40" r="4.5" fill={DOODLE_COLOR} />
              <Path d="M50 42 h.01 M54 40 h.01 M46 45 h.01" />
            </G>
            <G id="d4">
              <Path d="M16 40 C12 34 16 26 22 26 C22 18 30 14 36 18 C40 12 48 14 50 20 C58 18 64 26 60 32 C68 36 66 46 60 48 C62 56 54 62 48 58 C44 66 34 66 32 58 C24 62 16 56 20 48 C12 48 12 40 16 40 Z" />
              <Path d="M30 38 c2 -3 5 -3 7 0 M43 38 c2 -3 5 -3 7 0" />
              <Ellipse cx="40" cy="46" rx="4.5" ry="3.5" fill={DOODLE_COLOR} />
              <Path d="M36 51 c2 3 6 3 8 0 M40 52 c0 4 0 5 2 6" />
            </G>
            <G id="d5">
              <Path d="M16 24 C16 14 26 10 40 10 C54 10 64 14 64 24 L64 54 C64 64 54 70 40 70 C26 70 16 64 16 54 Z" />
              <Path d="M16 24 C8 22 6 34 12 40" />
              <Path d="M64 24 C72 22 74 34 68 40" />
              <Circle cx="40" cy="38" r="7" />
              <Circle cx="40" cy="38" r="2.5" fill={DOODLE_COLOR} />
              <Circle cx="40" cy="60" r="4.5" fill={DOODLE_COLOR} />
              <Path d="M26 26 h.01 M28 50 h.01 M52 22 h.01" />
            </G>
          </Defs>

          {Array.from({ length: repeats }, (_, repeat) =>
            PLACEMENTS.map(([id, x, y, rotation], index) => (
              <Use
                key={`${repeat}-${index}`}
                href={`#${id}`}
                transform={`translate(${x} ${y + repeat * PATTERN_HEIGHT}) rotate(${rotation} 52 52) scale(1.3)`}
              />
            )),
          )}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
  },
});
