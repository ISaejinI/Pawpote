import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, shadows, typography } from '@/theme';

import { Badge } from './badge';
import { Icon } from './icon';
import { Sticker, type StickerSize } from './sticker';

export type MatchCardProps = {
  name: string;
  photoUri?: string | null;
  /** Âge en années révolues (0 : « Bébé »). */
  age?: number;
  breed?: string;
  /** Distance déjà mise en forme (« à 1,2 km »). */
  distance?: string;
  /** Facultatif : la bulle disparaît si vide. */
  favoriteToy?: string;
  /** « Son petit caractère », facultatif : le bandeau disparaît si vide. */
  quirk?: string;
  /** `md` : écran de match · `sm` : aperçu réduit. */
  size?: StickerSize;
  style?: StyleProp<ViewStyle>;
};

const RADIUS = 32;

function formatAge(age: number) {
  if (age < 1) return 'Bébé';
  return `${age}\n${age > 1 ? 'ans' : 'an'}`;
}

/**
 * Carte d'un chien sur l'écran de match (CarteMatch, version B) :
 * photo plein cadre et infos en stickers. Elle remplit son conteneur.
 */
export function MatchCard({
  name,
  photoUri,
  age,
  breed,
  distance,
  favoriteToy,
  quirk,
  size = 'md',
  style,
}: MatchCardProps) {
  const toy = favoriteToy?.trim();
  const trait = quirk?.trim();

  // Résumé lu par les lecteurs d'écran à la place des stickers
  const summary = [
    name,
    age !== undefined && (age < 1 ? 'bébé' : `${age} ${age > 1 ? 'ans' : 'an'}`),
    breed,
    distance,
    toy && `jouet préféré : ${toy}`,
    trait && `son petit caractère : ${trait}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={[styles.card, style]} accessible accessibilityLabel={summary}>
      {/* La photo est découpée à part pour ne pas rogner l'ombre de la carte */}
      <View style={styles.photo}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="camera" size={34} strokeWidth={1.8} />
            <Text style={styles.placeholderText}>Sa photo principale</Text>
          </View>
        )}
      </View>

      {distance && (
        <Badge variant="distance" style={styles.distance}>
          {distance}
        </Badge>
      )}

      {age !== undefined && (
        <Sticker variant="age" size={size} style={styles.age}>
          {formatAge(age)}
        </Sticker>
      )}

      {toy && (
        <Sticker variant="bubble" label="Jouet préféré :" size={size} style={styles.toy}>
          {toy}
        </Sticker>
      )}

      {/* Les stickers du bas s'empilent : le nom remonte si le bandeau caractère est absent */}
      <View style={styles.bottom}>
        {breed && (
          <Sticker variant="breed" size={size} style={styles.breed}>
            {breed}
          </Sticker>
        )}
        <Sticker variant="name" size={size} style={styles.name}>
          {name}
        </Sticker>
        {trait && (
          <Sticker
            variant="bubble"
            label="Son petit caractère :"
            size={size}
            rotate={1.5}
            style={styles.trait}
          >
            {trait}
          </Sticker>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.peach300,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: RADIUS,
    ...shadows.lg,
  },
  photo: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: RADIUS - borderWidth.regular,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 70,
  },
  placeholderText: {
    ...typography.small,
    fontWeight: 700,
    color: colors.text,
  },
  distance: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  age: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  toy: {
    position: 'absolute',
    top: 96,
    left: 12,
    maxWidth: '70%',
  },
  bottom: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    gap: 8,
  },
  breed: {
    marginLeft: 8,
  },
  name: {
    maxWidth: '100%',
  },
  trait: {
    alignSelf: 'stretch',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
});
