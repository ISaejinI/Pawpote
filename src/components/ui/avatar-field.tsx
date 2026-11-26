import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

import { PhotoSlot } from './photo-slot';

export type AvatarFieldProps = {
  /** Photo choisie, ou `null`. */
  uri: string | null;
  /** Ouvre le choix de la source (galerie, appareil photo). */
  onPress: () => void;
  /** Phrase sous le libellé. */
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

/** Ma photo ronde, facultative, avec son libellé et une précision. */
export function AvatarField({
  uri,
  onPress,
  hint = 'Pour que les autres maîtres te reconnaissent au parc',
  style,
}: AvatarFieldProps) {
  return (
    <View style={[styles.row, style]}>
      <PhotoSlot
        variant="avatar"
        uri={uri}
        accessibilityLabel={uri ? 'Changer ta photo' : 'Ajouter ta photo'}
        onPress={onPress}
      />
      <View style={styles.text}>
        <Text style={styles.title}>
          Ta photo<Text style={styles.optional}> (facultatif)</Text>
        </Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  optional: {
    fontWeight: 500,
    color: colors.textMuted,
  },
  hint: {
    ...typography.label,
    fontWeight: 500,
    color: colors.text,
  },
});
