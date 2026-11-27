import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette } from '@/theme';

import { Avatar } from './avatar';

export type DuoAvatarProps = {
  dogName: string;
  ownerName: string;
  dogPhotoUri?: string | null;
  ownerPhotoUri?: string | null;
  /** Fond de l'avatar du chien sans photo. */
  dogColor?: string;
  /** Fond de l'avatar du maître sans photo. */
  ownerColor?: string;
  style?: StyleProp<ViewStyle>;
};

const DOG_SIZE = 48;
const OWNER_SIZE = 22;

/** Le chien en grand, son maître en médaillon en bas à droite (en-tête de conversation). */
export function DuoAvatar({
  dogName,
  ownerName,
  dogPhotoUri,
  ownerPhotoUri,
  dogColor,
  ownerColor,
  style,
}: DuoAvatarProps) {
  return (
    <View style={[styles.root, style]}>
      <Avatar
        uri={dogPhotoUri}
        size={DOG_SIZE}
        fallbackIcon="paw"
        color={dogColor}
        accessibilityLabel={`Photo de ${dogName}`}
      />
      <Avatar
        uri={ownerPhotoUri}
        size={OWNER_SIZE}
        color={ownerColor}
        accessibilityLabel={`Photo de ${ownerName}`}
        style={styles.owner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: DOG_SIZE,
    height: DOG_SIZE,
  },
  // Contour blanc cerclé d'ink, comme les stickers
  owner: {
    position: 'absolute',
    right: -5,
    bottom: -4,
    borderWidth: 2,
    borderColor: palette.white,
    boxShadow: `0 0 0 1.5px ${palette.ink}`,
  },
});
