import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { spacing } from '@/theme';

import { NewMatchItem } from './new-match-item';

type NewMatch = {
  id: string;
  dogName: string;
  photoUri?: string | null;
  color?: string;
  isNew?: boolean;
};

export type NewMatchesStripProps = {
  matches: NewMatch[];
  onPressMatch?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Nouveaux matchs pas encore contactés, en bande horizontale.
 * La bande déborde jusqu'au bord droit de l'écran pour inviter à faire défiler.
 */
export function NewMatchesStrip({ matches, onPressMatch, style }: NewMatchesStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.strip, style]}
      contentContainerStyle={styles.content}
    >
      {matches.map(({ id, ...match }) => (
        <NewMatchItem key={id} {...match} onPress={() => onPressMatch?.(id)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Annule la marge de la page : la bande va d'un bord à l'autre
  strip: {
    marginHorizontal: -spacing[4],
  },
  content: {
    gap: 10,
    // Laisse la place à l'anneau des nouveaux matchs
    paddingTop: 6,
    paddingBottom: 2,
    paddingHorizontal: spacing[4] + 4,
  },
});
