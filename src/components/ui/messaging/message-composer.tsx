import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';
import { MAX_MESSAGE_LENGTH } from '@shared/messaging';

import { IconButton } from '../base/icon-button';

export type MessageComposerProps = {
  /** Appelé avec le texte nettoyé ; le champ se vide ensuite. */
  onSend: (text: string) => Promise<void>;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

/** Barre de saisie d'un message : champ en pilule et bouton Envoyer. */
export function MessageComposer({
  onSend,
  placeholder = 'Écris un message…',
  style,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const canSend = !sending && text.trim().length > 0;

  async function send() {
    if (!canSend) return;
    setSending(true);
    setFailed(false);
    try {
      await onSend(text.trim());
      setText('');
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={style}>
      {failed && <Text accessibilityRole="alert" style={styles.error}>Message non envoyé. Réessaie.</Text>}
      <View style={styles.root}>
        <TextInput
          accessibilityLabel="Message"
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          cursorColor={colors.text}
          selectionColor={colors.active}
          multiline
          editable={!sending}
          maxLength={MAX_MESSAGE_LENGTH}
          style={styles.input}
        />
        <IconButton
          icon="send"
          accessibilityLabel="Envoyer"
          disabled={!canSend}
          onPress={() => { void send(); }}
        />
      </View>
    </View>
  );
}

const MIN_HEIGHT = 46;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  error: { ...typography.small, color: colors.danger, marginBottom: 6 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: MIN_HEIGHT,
    maxHeight: 120,
    paddingHorizontal: 16,
    // Centre la première ligne dans les 46 px de hauteur
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: colors.field,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.lg,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.text,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
