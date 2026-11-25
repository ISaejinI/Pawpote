import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { IconButton } from './icon-button';

export type SwipeActionsProps = {
  onPass: () => void;
  onLike: () => void;
  /** Ajoute le bouton « Voir tout son profil » entre les deux. */
  onDetails?: () => void;
  /** Prénom du chien, pour les libellés lus par les lecteurs d'écran. */
  dogName?: string;
  style?: StyleProp<ViewStyle>;
};

/** Boutons Passer et J'aime, avec en option le bouton de détail au centre. */
export function SwipeActions({ onPass, onLike, onDetails, dogName, style }: SwipeActionsProps) {
  const target = dogName ? ` ${dogName}` : ' ce chien';

  return (
    // 48 px d'écart entre Passer et J'aime ; 28 px avec le bouton central
    <View style={[styles.row, { gap: onDetails ? 28 : 48 }, style]}>
      <IconButton
        icon="close"
        variant="pass"
        size="lg"
        accessibilityLabel={`Passer${target}`}
        onPress={onPass}
      />
      {onDetails && (
        <IconButton
          icon="expand"
          variant="primary"
          size="ml"
          accessibilityLabel={dogName ? `Voir tout le profil de ${dogName}` : 'Voir tout son profil'}
          onPress={onDetails}
        />
      )}
      <IconButton
        icon="heart"
        variant="like"
        size="lg"
        accessibilityLabel={`J’aime${target}`}
        onPress={onLike}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
