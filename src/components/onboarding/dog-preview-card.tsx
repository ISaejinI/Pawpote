import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, Sticker } from '@/components/ui';
import { borderWidth, colors, radius, shadows, typography } from '@/theme';

type DogPreviewCardProps = {
  name: string;
  /** Âge déjà mis en forme sur deux lignes (« 3\nans »). */
  age?: string;
  breed?: string;
  photoUri?: string | null;
};

/** Aperçu de la carte de match du chien, telle que les autres la verront. */
export function DogPreviewCard({ name, age, breed, photoUri }: DogPreviewCardProps) {
  return (
    <View style={styles.card} accessibilityLabel={`Aperçu de la carte de ${name}`}>
      <View style={styles.photo}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="camera" size={32} strokeWidth={1.8} />
            <Text style={styles.placeholderText}>Sa photo principale</Text>
          </View>
        )}
      </View>

      {age && <Sticker variant="age" style={styles.age}>{age}</Sticker>}
      {breed && <Sticker variant="breed" style={styles.breed}>{breed}</Sticker>}
      <Sticker variant="name" style={styles.name}>{name}</Sticker>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    width: '78%',
    maxWidth: 290,
    aspectRatio: 290 / 400,
    transform: [{ rotate: '-2deg' }],
    backgroundColor: colors.peach300,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  // La photo est découpée à part pour ne pas rogner l'ombre de la carte
  photo: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: radius.xl - borderWidth.regular,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 60,
  },
  placeholderText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 15,
    color: colors.text,
  },
  age: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  breed: {
    position: 'absolute',
    left: 18,
    bottom: 76,
  },
  name: {
    position: 'absolute',
    left: 12,
    bottom: 22,
    maxWidth: '90%',
  },
});
