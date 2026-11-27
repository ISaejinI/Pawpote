import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { Chip } from '../base/chip';
import { Icon } from '../base/icon';

export type ParkRowProps = {
  name: string;
  /** Distance déjà mise en forme (« à 600 m »). */
  distance: string;
  /** Couleur de la pastille du repère. */
  dotColor: string;
  selected: boolean;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Parc proposé, avec un bouton Ajouter / Ajouté. */
export function ParkRow({ name, distance, dotColor, selected, onToggle, style }: ParkRowProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]}>
        <Icon name="pin-filled" size={16} />
      </View>

      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.distance}>{distance}</Text>
      </View>

      <Chip
        size="sm"
        label={selected ? 'Ajouté' : 'Ajouter'}
        icon="plus"
        selected={selected}
        onPress={onToggle}
        accessibilityLabel={`${selected ? 'Retirer' : 'Ajouter'} ${name}`}
        style={styles.chip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 12,
    backgroundColor: colors.field,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  dot: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  text: {
    flex: 1,
  },
  name: {
    ...typography.bodyStrong,
    fontSize: 15,
    lineHeight: 19,
    color: colors.text,
  },
  distance: {
    ...typography.small,
    fontWeight: 500,
    color: colors.text,
  },
  chip: {
    alignSelf: 'center',
  },
});
