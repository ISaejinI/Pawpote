import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';

import { useTapbarInset } from './tapbar';
import { WaveBackground } from './wave-background';

type TabPageInsets = { top: number; bottom: number };

export type TabPageProps = {
  /** Titre de page en `title-xl`. */
  title: string;
  contentStyle?: StyleProp<ViewStyle>;
} & (
  | { scroll?: true; children: ReactNode }
  // Le contenu occupe tout l'écran et reçoit les marges à conserver au repos.
  | { scroll: false; header?: ReactNode; children: (insets: TabPageInsets) => ReactNode }
);

/** Espace entre les blocs d'une page à onglet. */
const BLOCK_GAP = 22;

/** Gabarit des pages principales : fond à vagues, titre, contenu au-dessus de la Tapbar. */
export function TabPage(props: TabPageProps) {
  const { title, contentStyle } = props;
  const insets = useSafeAreaInsets();
  const tapbarInset = useTapbarInset();
  const [titleHeight, setTitleHeight] = useState<number>();

  const padding = {
    paddingTop: insets.top + spacing[5],
    paddingBottom: tapbarInset,
  };

  return (
    <View style={styles.root}>
      <WaveBackground />

      {props.scroll !== false ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.content, padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {props.children}
        </ScrollView>
      ) : (
        <View style={[styles.root, contentStyle]}>
          <View
            pointerEvents={props.header ? 'box-none' : 'none'}
            style={[styles.fixedHeader, { top: padding.paddingTop }]}
            onLayout={({ nativeEvent }) => setTitleHeight(nativeEvent.layout.height)}
          >
            {props.header ?? <Text style={styles.title} accessibilityRole="header">{title}</Text>}
          </View>
          {titleHeight !== undefined && props.children({
            top: padding.paddingTop + titleHeight + (props.header ? spacing[3] : BLOCK_GAP),
            bottom: tapbarInset,
          })}
        </View>
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
  fixedHeader: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 1,
  },
});
