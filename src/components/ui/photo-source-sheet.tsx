import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ImageSource } from '@/lib/pick-image';

import { ActionTile } from './action-tile';
import { BottomSheet } from './bottom-sheet';
import { Button } from './button';
import { TextLink } from './text-link';

export type PhotoSourceSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Source choisie, appelée une fois la modale fermée (la galerie ne peut pas s'ouvrir par-dessus). */
  onSelect: (source: ImageSource) => void;
  /** Affiche « Supprimer cette photo » (changement d'une photo existante). */
  onDelete?: () => void;
  title: string;
  subtitle?: string;
};

type PendingAction = { type: 'select'; source: ImageSource } | { type: 'delete' };

/** Modale « Ajouter / Changer la photo » : Galerie ou Caméra, éventuellement Supprimer, puis Annuler. */
export function PhotoSourceSheet({
  visible,
  onClose,
  onSelect,
  onDelete,
  title,
  subtitle,
}: PhotoSourceSheetProps) {
  const pending = useRef<PendingAction | null>(null);

  function choose(action: PendingAction) {
    pending.current = action;
    onClose();
  }

  function runPending() {
    const action = pending.current;
    pending.current = null;
    if (action?.type === 'select') onSelect(action.source);
    if (action?.type === 'delete') onDelete?.();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onClosed={runPending}
      title={title}
      subtitle={subtitle}
    >
      <View style={styles.tiles}>
        <ActionTile
          icon="gallery"
          title="Galerie"
          subtitle={'Choisir une photo\nde ton téléphone'}
          color="lavender"
          rotate={-1.5}
          onPress={() => choose({ type: 'select', source: 'library' })}
          style={styles.tile}
        />
        <ActionTile
          icon="camera"
          title="Caméra"
          subtitle={'Prendre une photo\nmaintenant'}
          color="lime"
          rotate={1.5}
          onPress={() => choose({ type: 'select', source: 'camera' })}
          style={styles.tile}
        />
      </View>

      {onDelete && (
        <TextLink tone="danger" icon="trash" onPress={() => choose({ type: 'delete' })}>
          Supprimer cette photo
        </TextLink>
      )}

      <Button variant="secondary" onPress={onClose}>
        Annuler
      </Button>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    gap: 14,
  },
  tile: {
    flex: 1,
  },
});
