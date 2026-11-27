import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, palette, typography } from '@/theme';

import { Avatar } from '../media/avatar';

export type NewMatchItemProps = Omit<PressableProps, 'children' | 'style'> & {
  dogName: string;
  photoUri?: string | null;
  /** Fond de l'avatar sans photo. */
  color?: string;
  /** Match tout juste arrivé : anneau mandarin autour de l'avatar. */
  isNew?: boolean;
  style?: StyleProp<ViewStyle>;
};

const AVATAR_SIZE = 64;

/** Un nouveau match, pas encore contacté : avatar rond et nom du chien. */
export function NewMatchItem({ dogName, photoUri, color, isNew = false, style, ...rest }: NewMatchItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isNew ? 'Nouveau match' : 'Match'} : ${dogName}. Écrire un message`}
      style={({ pressed }) => [styles.item, pressed && styles.pressed, style]}
      {...rest}
    >
      <Avatar
        uri={photoUri}
        size={AVATAR_SIZE}
        fallbackIcon="paw"
        color={color}
        style={isNew && styles.ring}
      />
      <Text style={styles.name} numberOfLines={1}>
        {dogName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    width: 70,
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  // Liseré du fond de l'écran, puis anneau mandarin
  ring: {
    boxShadow: `0 0 0 3px ${palette.lavender100}, 0 0 0 5.5px ${palette.mandarin600}`,
  },
  name: {
    ...typography.small,
    fontWeight: 700,
    color: colors.text,
  },
});
