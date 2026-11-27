import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, shadows, typography } from '@/theme';
import type { WalkStatus } from '@shared/messaging';

import { Button } from '../base/button';
import { Icon } from '../base/icon';
import type { IconName } from '../base/icons';

export type WalkProposalCardProps = {
  /** Date et heure (« Samedi 29 nov. · 9 h 30 »). */
  date: string;
  place: string;
  /** Durée prévue (« Environ 1 h »). */
  duration: string;
  /** `them` : proposition reçue, avec les boutons de réponse · `me` : proposition envoyée. */
  from: 'me' | 'them';
  status?: WalkStatus;
  onAccept?: () => void;
  onSuggestOtherDate?: () => void;
  calendarActions?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Proposition de balade dans une conversation : quand, où, combien de temps. */
export function WalkProposalCard({
  date,
  place,
  duration,
  from,
  status = 'pending',
  onAccept,
  onSuggestOtherDate,
  calendarActions,
  style,
}: WalkProposalCardProps) {
  return (
    <View style={[styles.card, from === 'me' ? styles.mine : styles.theirs, style]}>
      {/* Coins rognés dans une vue intérieure : sur la carte, ils couperaient l'ombre */}
      <View style={styles.clip}>
        <View style={styles.header}>
          <Icon name="paw" size={18} />
          <Text style={styles.title}>Proposition de balade</Text>
        </View>

        <View style={styles.body}>
          <Detail icon="calendar" label={date} />
          <Detail icon="pin-filled" label={place} />
          <Detail icon="clock" label={duration} />

          {status !== 'pending' && (
            <Text style={styles.detailText}>{status === 'accepted' ? 'Balade confirmée' : 'Autre date proposée'}</Text>
          )}
          {status === 'accepted' && calendarActions}

          {from === 'them' && status === 'pending' && onAccept && onSuggestOtherDate && (
            <View style={styles.actions}>
              <Button size="xs" onPress={onAccept} style={styles.action}>
                Accepter
              </Button>
              <Button variant="secondary" size="xs" onPress={onSuggestOtherDate} style={styles.action}>
                Autre date
              </Button>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function Detail({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.detail}>
      <Icon name={icon} size={18} />
      <Text style={styles.detailText}>{label}</Text>
    </View>
  );
}

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  card: {
    width: 268,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: CARD_RADIUS,
    ...shadows.md,
  },
  clip: {
    borderRadius: CARD_RADIUS - borderWidth.regular,
    overflow: 'hidden',
  },
  theirs: {
    alignSelf: 'flex-start',
  },
  mine: {
    alignSelf: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderBottomWidth: borderWidth.regular,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.label,
    fontWeight: 800,
    color: colors.text,
  },
  body: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 12,
    gap: 6,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    ...typography.label,
    color: colors.text,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  action: {
    flex: 1,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
});
