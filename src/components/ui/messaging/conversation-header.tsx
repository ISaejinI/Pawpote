import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderWidth, colors, spacing, typography } from '@/theme';

import { DuoAvatar } from '../media/duo-avatar';
import { IconButton } from '../base/icon-button';

export type ConversationHeaderProps = {
  dogName: string;
  ownerName: string;
  /** Distance entre les deux maîtres (« à 800 m »). */
  distance?: string;
  dogPhotoUri?: string | null;
  ownerPhotoUri?: string | null;
  dogColor?: string;
  ownerColor?: string;
  onBack: () => void;
  onProposeWalk?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** En-tête d'une conversation : retour, chien et maître, bouton Proposer une balade. */
export function ConversationHeader({
  dogName,
  ownerName,
  distance,
  dogPhotoUri,
  ownerPhotoUri,
  dogColor,
  ownerColor,
  onBack,
  onProposeWalk,
  style,
}: ConversationHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing[3] }, style]}>
      <IconButton icon="back" variant="surface" size="sm" accessibilityLabel="Retour aux messages" onPress={onBack} />

      <DuoAvatar
        dogName={dogName}
        ownerName={ownerName}
        dogPhotoUri={dogPhotoUri}
        ownerPhotoUri={ownerPhotoUri}
        dogColor={dogColor}
        ownerColor={ownerColor}
      />

      <View style={styles.titles}>
        <Text style={styles.name} accessibilityRole="header" numberOfLines={1}>
          {dogName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          avec {ownerName}
          {distance ? ` · ${distance}` : ''}
        </Text>
      </View>

      <IconButton
        icon="propose-walk"
        shape="square"
        accessibilityLabel="Proposer une balade"
        onPress={onProposeWalk}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
    backgroundColor: colors.background,
    borderBottomWidth: borderWidth.regular,
    borderBottomColor: colors.border,
    zIndex: 1,
  },
  titles: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  name: {
    ...typography.titleMd,
    lineHeight: 24,
    color: colors.text,
  },
  subtitle: {
    ...typography.small,
    color: colors.text,
  },
});
