import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, shadows, typography } from '@/theme';

import { Badge } from '../base/badge';
import { Icon } from '../base/icon';
import { Sticker, type StickerSize } from '../base/sticker';

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
  /** `md` : écran de match · `sm` : aperçu réduit. */
  size?: StickerSize;
  style?: StyleProp<ViewStyle>;
};

export const MATCH_CARD_RADIUS = 32;

/** Chiffre et unité du macaron d'âge (« 3 » + « ans »), ou « Bébé » avant 1 an. */
function ageSticker(age: number) {
  if (age < 1) return { value: 'Bébé', unit: undefined };
  return { value: String(age), unit: age > 1 ? 'ans' : 'an' };
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
  size = 'md',
  style,
}: MatchCardProps) {
  const toy = favoriteToy?.trim();

  // Résumé lu par les lecteurs d'écran à la place des stickers
  const summary = [
    name,
    age !== undefined && (age < 1 ? 'bébé' : `${age} ${age > 1 ? 'ans' : 'an'}`),
    breed,
    distance,
    toy && `jouet préféré : ${toy}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={[styles.card, style]} accessible accessibilityLabel={summary}>
      {/* La photo est découpée à part pour ne pas rogner l'ombre de la carte */}
      <View style={styles.photo}>
        {photoUri ? (
          <Image source={photoUri} style={StyleSheet.absoluteFill} contentFit="cover" />
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
        <Sticker variant="age" size={size} label={ageSticker(age).unit} style={styles.age}>
          {ageSticker(age).value}
        </Sticker>
      )}

      <View style={styles.bottom}>
        {breed && (
          <Sticker variant="breed" size={size} style={styles.breed}>
            {breed}
          </Sticker>
        )}
        <Sticker variant="name" size={size} style={styles.name}>
          {name}
        </Sticker>
        {toy && (
          <Sticker
            variant="bubble"
            label="Jouet préféré :"
            size={size}
            rotate={1.5}
            style={styles.toy}
          >
            {toy}
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
    borderRadius: MATCH_CARD_RADIUS,
    ...shadows.lg,
  },
  photo: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: MATCH_CARD_RADIUS - borderWidth.regular,
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
  toy: {
    alignSelf: 'stretch',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
});
