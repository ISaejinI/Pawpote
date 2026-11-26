import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { ProfileAvatars } from './profile-avatars';

type SummaryDog = {
  name: string;
  /** « Berger australien · 3 ans ». */
  details?: string;
  photoUri?: string | null;
  color?: string;
};

export type ProfileSummaryCardProps = {
  owner: { firstName: string; photoUri?: string | null; color?: string };
  dogs: SummaryDog[];
  style?: StyleProp<ViewStyle>;
};

/** « Biscotte », « Biscotte et Pistache », « Biscotte, Pistache et Nala ». */
function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}

/**
 * Carte d'en-tête du profil.
 * - Un chien : il est à l'honneur, son maître en médaillon.
 * - Plusieurs chiens : le maître au centre, ses chiens en médaillons.
 */
export function ProfileSummaryCard({ owner, dogs, style }: ProfileSummaryCardProps) {
  const single = dogs.length === 1 ? dogs[0] : null;

  return (
    <View accessibilityLabel="Aperçu de mon profil" style={[styles.card, style]}>
      {single ? (
        <ProfileAvatars
          main={{ name: single.name, photoUri: single.photoUri, color: single.color, missingLabel: 'Photo du chien' }}
          companions={[{ kind: 'owner', name: owner.firstName, photoUri: owner.photoUri, color: owner.color }]}
        />
      ) : (
        <ProfileAvatars
          main={{ name: owner.firstName, photoUri: owner.photoUri, color: owner.color, missingLabel: 'Ta photo' }}
          companions={dogs.map((dog) => ({ kind: 'dog' as const, ...dog }))}
        />
      )}

      <View style={[styles.text, !single && styles.textAfterStack]}>
        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
          {single ? single.name : owner.firstName}
        </Text>
        <Text style={styles.details} numberOfLines={2}>
          {single ? single.details : joinNames(dogs.map((dog) => dog.name))}
        </Text>
        <Text style={styles.hand}>
          {single
            ? `et sa personne préférée, ${owner.firstName}`
            : `${dogs.length} chiens, ${dogs.length} fois plus de balades`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  // Laisse la place aux médaillons qui débordent de la photo
  textAfterStack: {
    paddingLeft: 8,
  },
  name: {
    ...typography.titleLg,
    lineHeight: 30,
    color: colors.text,
  },
  details: {
    ...typography.label,
    color: colors.text,
  },
  hand: {
    ...typography.hand,
    lineHeight: 19,
    color: colors.text,
  },
});
