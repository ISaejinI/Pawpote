import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

import { Avatar } from './avatar';
import { Icon } from './icon';
import { ProgressBar } from './progress-bar';

export type DogRowProps = Omit<PressableProps, 'children' | 'style'> & {
  name: string;
  /** « Berger australien · 3 ans ». */
  details?: string;
  photoUri?: string | null;
  /** Fond de la pastille photo tant qu'il n'y a pas de photo. */
  color?: string;
  /** Complétion de la fiche, entre 0 et 1. */
  completion: number;
  style?: StyleProp<ViewStyle>;
};

/** Un de mes chiens : photo, nom, race et âge, avancement de sa fiche. Se range dans un `MenuSection`. */
export function DogRow({ name, details, photoUri, color, completion, style, ...rest }: DogRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Fiche de ${name}${details ? `, ${details}` : ''}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      {...rest}
    >
      <Avatar uri={photoUri} size={50} fallbackIcon="camera" color={color} style={styles.avatar} />

      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {details && (
          <Text style={styles.details} numberOfLines={1}>
            {details}
          </Text>
        )}
        <ProgressBar
          size="mini"
          value={completion}
          accessibilityLabel={`Complétion du profil de ${name}`}
          style={styles.progress}
        />
      </View>

      <Icon name="chevron-right" size={18} strokeWidth={2.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pressed: {
    backgroundColor: colors.lavender100,
  },
  // Contour plus fin que l'avatar standard, comme dans la maquette
  avatar: {
    borderWidth: 2,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  details: {
    ...typography.small,
    fontWeight: 500,
    color: colors.text,
  },
  progress: {
    marginTop: 2,
  },
});
