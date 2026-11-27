import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';

import { ConversationRow } from './conversation-row';

type Conversation = {
  id: string;
  dogName: string;
  ownerName: string;
  photoUri?: string | null;
  color?: string;
  time: string;
  lastMessage: string;
  unread?: number;
  lastMessageRead?: boolean;
};

export type ConversationListProps = {
  conversations: Conversation[];
  onPressConversation?: (id: string) => void;
  /** Texte affiché quand la liste est vide. */
  emptyText?: string;
  style?: StyleProp<ViewStyle>;
};

/** Les discussions en cours, regroupées dans une carte cream. */
export function ConversationList({
  conversations,
  onPressConversation,
  emptyText = 'Aucune discussion pour l’instant.',
  style,
}: ConversationListProps) {
  return (
    <View style={[styles.card, style]}>
      {/* Coins rognés dans une vue intérieure : sur la carte, ils couperaient l'ombre */}
      <View style={styles.clip}>
        {conversations.length === 0 ? (
          <Text style={styles.empty}>{emptyText}</Text>
        ) : (
          conversations.map(({ id, ...conversation }, index) => (
            <ConversationRow
              key={id}
              {...conversation}
              divider={index > 0}
              onPress={() => onPressConversation?.(id)}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  clip: {
    borderRadius: radius.lg - borderWidth.regular,
    overflow: 'hidden',
  },
  empty: {
    ...typography.hand,
    color: colors.text,
    padding: 16,
  },
});
