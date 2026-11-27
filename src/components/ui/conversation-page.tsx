import { useRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderWidth, colors, spacing } from '@/theme';

import { ChatBackground } from './chat-background';

export type ConversationPageProps = {
  /** En-tête fixe (`ConversationHeader`). */
  header: ReactNode;
  /** Barre de saisie (`MessageComposer`), gardée au-dessus du clavier. */
  composer: ReactNode;
  /** Le fil des messages, du plus ancien au plus récent. */
  children: ReactNode;
  overlay?: ReactNode;
  overlayVisible?: boolean;
};

/**
 * Gabarit d'une conversation : en-tête, fil de messages sur le fond à têtes de chiens,
 * barre de saisie en bas. Le fil s'ouvre sur les derniers messages.
 */
export function ConversationPage({ header, composer, children, overlay, overlayVisible = false }: ConversationPageProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const nearBottom = useRef(true);

  return (
    <View style={styles.root}>
      <View
        style={styles.root}
        accessibilityElementsHidden={overlayVisible}
        importantForAccessibility={overlayVisible ? 'no-hide-descendants' : 'auto'}
      >
        {header}

        <KeyboardAvoidingView behavior="padding" enabled={!overlayVisible} style={styles.root}>
          <View style={styles.thread}>
            <ChatBackground />
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messages}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
              onScroll={({ nativeEvent: { contentOffset, layoutMeasurement, contentSize } }) => {
                nearBottom.current = contentSize.height - layoutMeasurement.height - contentOffset.y < 80;
              }}
              scrollEventThrottle={100}
              onContentSizeChange={() => { if (nearBottom.current) scrollRef.current?.scrollToEnd({ animated: false }); }}
              onLayout={() => { if (nearBottom.current) scrollRef.current?.scrollToEnd({ animated: false }); }}
            >
              {children}
            </ScrollView>
          </View>

          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing[3]) }]}>
            {composer}
          </View>
        </KeyboardAvoidingView>
      </View>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  thread: {
    flex: 1,
  },
  messages: {
    // Peu de messages : ils se calent en bas, près de la barre de saisie
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  composer: {
    paddingTop: 10,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.background,
    borderTopWidth: borderWidth.regular,
    borderTopColor: colors.border,
  },
});
