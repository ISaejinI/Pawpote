import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, shadows } from '@/theme';

import { PhotoSlot } from './photo-slot';
import { TextLink } from './text-link';

/** Emplacement touché : la photo principale ou une vignette (0 à 2). */
export type DogPhotoTarget = 'main' | number;

export type DogPhotosEditorProps = {
  dogName: string;
  mainPhoto: string | null;
  /** Trois emplacements secondaires. */
  extraPhotos: (string | null)[];
  onPressPhoto: (target: DogPhotoTarget) => void;
  onPreview?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
};

/** Photos d'une fiche de chien : la principale en grand, trois vignettes, aperçu de la carte. */
export function DogPhotosEditor({
  dogName,
  mainPhoto,
  extraPhotos,
  onPressPhoto,
  onPreview,
  onLayout,
  style,
}: DogPhotosEditorProps) {
  return (
    <View
      accessibilityLabel={`Photos de ${dogName}`}
      style={[styles.card, style]}
      onLayout={onLayout}
    >
      <PhotoSlot
        variant="main"
        uri={mainPhoto}
        title="Photo principale"
        accessibilityLabel={mainPhoto ? 'Changer sa photo principale' : 'Ajouter sa photo principale'}
        onPress={() => onPressPhoto('main')}
        style={styles.main}
      />

      <View style={styles.thumbs}>
        {extraPhotos.map((uri, index) => (
          <PhotoSlot
            key={index}
            variant="thumb"
            uri={uri}
            accessibilityLabel={uri ? `Changer la photo ${index + 2}` : 'Ajouter une photo'}
            onPress={() => onPressPhoto(index)}
            style={styles.thumb}
          />
        ))}
      </View>

      {onPreview && (
        <TextLink icon="eye" onPress={onPreview} style={styles.preview}>
          Voir sa carte de match
        </TextLink>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: 24,
    ...shadows.md,
  },
  main: {
    flexGrow: 0,
    minHeight: 0,
    height: 250,
  },
  thumbs: {
    flexDirection: 'row',
    gap: 10,
  },
  thumb: {
    flex: 1,
    height: 80,
  },
  preview: {
    alignSelf: 'center',
  },
});
