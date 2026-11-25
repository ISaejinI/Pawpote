import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';

import { useTapbarInset } from './tapbar';
import { WaveBackground } from './wave-background';

export type TabPageProps = {
  /** Titre de page en `title-xl`. */
  title: string;
  /**
   * `true` (par défaut) : la page défile sous la Tapbar fixe.
   * `false` : contenu en pleine hauteur (ex. le swipe).
   */
  scroll?: boolean;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Espace entre les blocs d'une page à onglet. */
const BLOCK_GAP = 22;

/** Gabarit des pages principales : fond à vagues, titre, contenu au-dessus de la Tapbar. */
export function TabPage({ title, scroll = true, children, contentStyle }: TabPageProps) {
  const insets = useSafeAreaInsets();
  const tapbarInset = useTapbarInset();

  const padding = {
    paddingTop: insets.top + spacing[5],
    paddingBottom: tapbarInset,
  };

  const content = (
    <>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </>
  );

  return (
    <View style={styles.root}>
      <WaveBackground />

      {scroll ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.content, padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.root, styles.content, padding, contentStyle]}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[4],
    gap: BLOCK_GAP,
  },
  title: {
    ...typography.titleXl,
    color: colors.text,
  },
});
