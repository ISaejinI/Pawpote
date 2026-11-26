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
};

/**
 * Gabarit d'une conversation : en-tête, fil de messages sur le fond à têtes de chiens,
 * barre de saisie en bas. Le fil s'ouvre sur les derniers messages.
 */
export function ConversationPage({ header, composer, children }: ConversationPageProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);

  return (
    <View style={styles.root}>
      {header}

      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <View style={styles.thread}>
          <ChatBackground />
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            // Garde les derniers messages visibles à l'ouverture et quand le clavier apparaît
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {children}
          </ScrollView>
        </View>

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing[3]) }]}>
          {composer}
        </View>
      </KeyboardAvoidingView>
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
