import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, palette, radius, typography } from '@/theme';

import { Avatar } from './avatar';
import { Badge } from './badge';
import { Icon } from './icon';
import { Sticker } from './sticker';
import { Tag } from './tag';

export type DogProfilePark = { name: string; /** Parc fréquenté aussi par l'utilisateur. */ shared?: boolean };

export type DogProfileProps = {
  name: string;
  /** Distance déjà mise en forme (« à 1,2 km »). */
  distance?: string;
  sex?: 'female' | 'male';
  /** Âge en années révolues. */
  age?: number;
  breed?: string;
  activities?: string[];
  traits?: string[];
  favoriteToy?: string;
  quirk?: string;
  description?: string;
  parks?: DogProfilePark[];
  ownerName?: string;
  ownerPhoto?: string | null;
  style?: StyleProp<ViewStyle>;
};

function formatAge(age: number) {
  if (age < 1) return 'Moins d’un an';
  return `${age} ${age > 1 ? 'ans' : 'an'}`;
}

/** Tout le profil d'un chien, affiché sous ses photos sur la page de détail. */
export function DogProfile({
  name,
  distance,
  sex,
  age,
  breed,
  activities = [],
  traits = [],
  favoriteToy,
  quirk,
  description,
  parks = [],
  ownerName,
  ownerPhoto,
  style,
}: DogProfileProps) {
  const toy = favoriteToy?.trim();
  const trait = quirk?.trim();
  const hasInfos = !!sex || age !== undefined || !!breed || activities.length > 0;

  return (
    <View style={[styles.root, style]}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.name} accessibilityRole="header">
            {name}
          </Text>
          {distance && (
            <View style={styles.distance}>
              <Icon name="pin-filled" size={16} />
              <Text style={styles.distanceText}>{distance} de chez toi</Text>
            </View>
          )}
        </View>

        {ownerName && (
          <View style={styles.owner}>
            <Avatar
              uri={ownerPhoto}
              size={62}
              raised
              accessibilityLabel={`Photo de ${ownerName}`}
            />
            <View style={styles.ownerSticker}>
              <Text style={styles.ownerText}>avec {ownerName}</Text>
            </View>
          </View>
        )}
      </View>

      {hasInfos && (
        <View style={styles.infos}>
          <Text style={styles.sectionTitle}>Ses infos</Text>
          <View style={styles.tags}>
            {sex && (
              <Tag icon={sex === 'female' ? 'female' : 'male'}>
                {sex === 'female' ? 'Femelle' : 'Mâle'}
              </Tag>
            )}
            {age !== undefined && <Tag icon="cake">{formatAge(age)}</Tag>}
            {breed && <Tag icon="paw">{breed}</Tag>}
            {activities.map((activity) => (
              <Tag key={activity} icon="park">
                {activity}
              </Tag>
            ))}
          </View>
        </View>
      )}

      {traits.length > 0 && (
        <Section title="Son caractère">
          <View style={styles.tags}>
            {traits.map((item) => (
              <Tag key={item} color="pink">
                {item}
              </Tag>
            ))}
          </View>
        </Section>
      )}

      {(toy || trait) && (
        <View style={styles.bubbles}>
          {toy && (
            <Sticker variant="bubble" tone="white" label="Jouet préféré :" rotate={-2} style={styles.bubble}>
              {toy}
            </Sticker>
          )}
          {trait && (
            <Sticker variant="bubble" tone="pink" label="Sa petite particularité :" rotate={2} style={styles.bubble}>
              {trait}
            </Sticker>
          )}
        </View>
      )}

      {description?.trim() && (
        <Section title="Description">
          <Text style={styles.description}>{description.trim()}</Text>
        </Section>
      )}

      {parks.length > 0 && (
        <Section title="Ses parcs">
          <View style={styles.parks}>
            {parks.map((park) => (
              <View key={park.name} style={styles.park}>
                <Icon name="park" size={18} />
                <Text style={styles.parkName} numberOfLines={1}>
                  {park.name}
                </Text>
                {park.shared && <Badge variant="highlight">En commun</Badge>}
              </View>
            ))}
          </View>
        </Section>
      )}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  identity: {
    flex: 1,
    gap: 6,
  },
  name: {
    ...typography.titleXl,
    color: colors.text,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    ...typography.label,
    fontWeight: 600,
    color: colors.text,
  },
  owner: {
    alignItems: 'center',
  },
  ownerSticker: {
    marginTop: -10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: colors.lime500,
    borderWidth: borderWidth.sticker,
    borderColor: colors.white,
    borderRadius: radius.pill,
    boxShadow: `0 0 0 2px ${palette.ink}`,
    transform: [{ rotate: '4deg' }],
  },
  ownerText: {
    fontFamily: typography.hand.fontFamily,
    fontSize: 16,
    lineHeight: 19,
    color: colors.text,
  },
  infos: {
    gap: 10,
    padding: 14,
    backgroundColor: colors.background,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bubbles: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bubble: {
    flex: 1,
    alignSelf: 'stretch',
  },
  description: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  parks: {
    gap: 8,
  },
  park: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.field,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  parkName: {
    ...typography.label,
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
    color: colors.text,
  },
});
