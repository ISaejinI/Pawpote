import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

import { Button } from '../base/button';
import { IconButton } from '../base/icon-button';

export type EditHeaderProps = {
  title: string;
  onBack: () => void;
  /** Libellé du bouton d'action (« Enregistrer ») ; sans lui, pas de bouton. */
  actionLabel?: string;
  onAction?: () => void;
  /** Enregistrement en cours : bouton en chargement. */
  loading?: boolean;
  /** Libellé lu par les lecteurs d'écran pour le retour. */
  backLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** En-tête d'une page d'édition : retour, titre et, s'il y a lieu, bouton Enregistrer. */
export function EditHeader({
  title,
  onBack,
  actionLabel,
  onAction,
  loading = false,
  backLabel = 'Retour',
  style,
}: EditHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <IconButton icon="back" variant="surface" accessibilityLabel={backLabel} onPress={onBack} />
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Button size="sm" onPress={onAction} loading={loading} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    ...typography.titleLg,
    flex: 1,
    color: colors.text,
  },
  action: {
    paddingHorizontal: 18,
  },
});
