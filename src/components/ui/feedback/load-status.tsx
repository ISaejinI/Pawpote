import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { TextLink } from '../base/text-link';

export type LoadStatusProps = {
  /** Message d'échec ; sans lui, indicateur de chargement. */
  error?: string;
  onRetry?: () => void;
  /** Lu par les lecteurs d'écran pendant le chargement. */
  loadingLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Contenu d'une page en attente : chargement, ou échec avec « Réessayer ». */
export function LoadStatus({ error, onRetry, loadingLabel = 'Chargement', style }: LoadStatusProps) {
  return (
    <View style={[styles.root, style]}>
      {error ? (
        <>
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
          {onRetry && <TextLink onPress={onRetry}>Réessayer</TextLink>}
        </>
      ) : (
        <ActivityIndicator color={colors.text} accessibilityLabel={loadingLabel} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
});
