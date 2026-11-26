import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { ProfileAvatars } from './profile-avatars';
import { TextLink } from './text-link';

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
  /** `loading` : chargement en cours · `error` : échec, avec le lien Réessayer. */
  status?: 'ready' | 'loading' | 'error';
  onRetry?: () => void;
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
export function ProfileSummaryCard({
  owner,
  dogs,
  status = 'ready',
  onRetry,
  style,
}: ProfileSummaryCardProps) {
  const single = dogs.length === 1 ? dogs[0] : null;

  if (status !== 'ready') {
    return (
      <View
        accessibilityLabel="Aperçu de mon profil"
        style={[styles.card, styles.pending, style]}
      >
        {status === 'loading' ? (
          <ActivityIndicator color={colors.text} accessibilityLabel="Chargement du profil" />
        ) : (
          <>
            <Text style={styles.error} accessibilityRole="alert">
              Impossible de charger ton profil.
            </Text>
            {onRetry && <TextLink onPress={onRetry}>Réessayer</TextLink>}
          </>
        )}
      </View>
    );
  }

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
            : dogs.length === 0
              ? 'Ajoute ton premier chien !'
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
  // Chargement ou erreur : même hauteur que la carte remplie (photo de 96 px)
  pending: {
    minHeight: 96 + 18 + 16 + 5,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
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
