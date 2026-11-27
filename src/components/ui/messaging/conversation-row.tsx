import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, typography } from '@/theme';

import { Avatar } from '../media/avatar';
import { Badge } from '../base/badge';
import { Icon } from '../base/icon';

export type ConversationRowProps = Omit<PressableProps, 'children' | 'style'> & {
  dogName: string;
  ownerName: string;
  photoUri?: string | null;
  /** Fond de l'avatar sans photo. */
  color?: string;
  /** Heure ou jour du dernier message (« 10:08 », « Hier »). */
  time: string;
  lastMessage: string;
  /** Messages non lus : pastille mandarin et aperçu en gras. */
  unread?: number;
  /** Mon dernier message a été lu : double coche devant l'aperçu. */
  lastMessageRead?: boolean;
  /** Trait de séparation avec la ligne du dessus. */
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Une discussion dans la liste des messages : chien, maître, aperçu du dernier message. */
export function ConversationRow({
  dogName,
  ownerName,
  photoUri,
  color,
  time,
  lastMessage,
  unread = 0,
  lastMessageRead = false,
  divider = false,
  style,
  ...rest
}: ConversationRowProps) {
  const hasUnread = unread > 0;
  const unreadLabel = hasUnread ? `, ${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}` : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dogName} avec ${ownerName}, ${time} : ${lastMessage}${unreadLabel}`}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed, style]}
      {...rest}
    >
      <Avatar uri={photoUri} size={54} fallbackIcon="paw" color={color} />

      <View style={styles.body}>
        <View style={styles.heading}>
          <Text style={styles.dogName} numberOfLines={1}>
            {dogName}
          </Text>
          <Text style={styles.ownerName} numberOfLines={1}>
            avec {ownerName}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <View style={styles.preview}>
          {lastMessageRead && !hasUnread && (
            <Icon name="check-double" size={16} color={colors.link} strokeWidth={2.4} />
          )}
          <Text style={[styles.message, hasUnread && styles.messageUnread]} numberOfLines={1}>
            {lastMessage}
          </Text>
          {hasUnread && <Badge variant="unread">{unread}</Badge>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  divider: {
    borderTopWidth: borderWidth.thin,
    borderTopColor: 'rgba(30, 18, 64, 0.14)',
  },
  pressed: {
    backgroundColor: colors.lavender100,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  dogName: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
  },
  ownerName: {
    ...typography.small,
    color: colors.text,
    flexShrink: 1,
  },
  time: {
    ...typography.caption,
    fontSize: 12,
    marginLeft: 'auto',
    color: colors.text,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  message: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
    color: colors.text,
  },
  messageUnread: {
    fontWeight: 700,
  },
});
