import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette } from '@/theme';

import { Avatar } from './avatar';

type AvatarPerson = {
  name: string;
  photoUri?: string | null;
  color?: string;
};

export type ProfileAvatarsProps = {
  /** Grande photo : le chien (un seul chien) ou le maître (plusieurs chiens). */
  main: AvatarPerson & {
    /** Consigne sur la photo manquante (« Photo du chien », « Ta photo »). */
    missingLabel: string;
  };
  /** Médaillons en bas à droite, qui se chevauchent s'ils sont plusieurs. */
  companions: (AvatarPerson & { kind: 'dog' | 'owner' })[];
  style?: StyleProp<ViewStyle>;
};

const MAIN_SIZE = 96;
const SINGLE_SIZE = 38;
const STACK_SIZE = 42;
/** Chevauchement de deux médaillons voisins (px). */
const STACK_OVERLAP = 12;

/** Grande photo ronde de l'en-tête du profil, avec ses médaillons (maître ou chiens). */
export function ProfileAvatars({ main, companions, style }: ProfileAvatarsProps) {
  const stacked = companions.length > 1;
  const size = stacked ? STACK_SIZE : SINGLE_SIZE;

  return (
    <View style={[styles.root, style]}>
      <Avatar
        uri={main.photoUri}
        size={MAIN_SIZE}
        color={main.color}
        fallbackIcon="camera"
        fallbackLabel={main.missingLabel}
        accessibilityLabel={`Photo de ${main.name}`}
      />

      <View style={[styles.companions, stacked ? styles.stackPosition : styles.singlePosition]}>
        {companions.map((companion, index) => (
          <Avatar
            key={`${companion.name}-${index}`}
            uri={companion.photoUri}
            size={size}
            color={companion.color}
            fallbackIcon={companion.kind === 'dog' ? 'paw' : 'user'}
            accessibilityLabel={`Photo de ${companion.name}`}
            style={[styles.companion, index > 0 && styles.overlap]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: MAIN_SIZE,
    height: MAIN_SIZE,
  },
  companions: {
    position: 'absolute',
    flexDirection: 'row',
  },
  singlePosition: {
    right: -6,
    bottom: -4,
  },
  stackPosition: {
    right: -14,
    bottom: -6,
  },
  // Contour blanc cerclé d'ink, comme les stickers
  companion: {
    borderWidth: 3,
    borderColor: palette.white,
    boxShadow: `0 0 0 2px ${palette.ink}`,
  },
  overlap: {
    marginLeft: -STACK_OVERLAP,
  },
});
