import type { ComponentRef, ReactNode, Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme';

import { WaveBackground } from './wave-background';

export type EditPageScrollRef = ComponentRef<typeof KeyboardAwareScrollView>;

export type EditPageProps = {
  /** En-tête (`EditHeader`), qui défile avec la page. */
  header: ReactNode;
  children: ReactNode;
  /** Pour faire défiler la page jusqu'à une section. */
  scrollRef?: Ref<EditPageScrollRef>;
};

/** Gabarit d'une page d'édition hors onglets : fond à vagues, en-tête et sections qui défilent. */
export function EditPage({ header, children, scrollRef }: EditPageProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <WaveBackground />

      {/* Garde le champ actif au-dessus du clavier */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.root}
        bottomOffset={spacing[6]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing[3], paddingBottom: insets.bottom + spacing[6] },
        ]}
      >
        {header}
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[5],
  },
});
