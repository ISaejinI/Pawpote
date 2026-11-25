import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme';

import { PageDots } from './page-dots';

export type PhotoCarouselProps = {
  photos: string[];
  height: number;
  /** Décrit les photos (« Photo de Biscotte »). */
  accessibilityLabel: string;
  /** Décale les points vers le haut (ex. sous une feuille qui chevauche la photo). */
  dotsOffset?: number;
  style?: StyleProp<ViewStyle>;
};

/** Photos pleine largeur qui défilent horizontalement, avec indicateur de page. */
export function PhotoCarousel({
  photos,
  height,
  accessibilityLabel,
  dotsOffset = 16,
  style,
}: PhotoCarouselProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <View style={[styles.root, { height }, style]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
      >
        {photos.map((uri, i) => (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width, height }}
            contentFit="cover"
            accessibilityLabel={`${accessibilityLabel} (${i + 1} sur ${photos.length})`}
          />
        ))}
      </ScrollView>

      <PageDots
        count={photos.length}
        index={index}
        style={[styles.dots, { bottom: dotsOffset }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.lavender200,
    overflow: 'hidden',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
