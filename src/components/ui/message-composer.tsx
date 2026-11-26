import { useState } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { IconButton } from './icon-button';

export type MessageComposerProps = {
  /** Appelé avec le texte nettoyé ; le champ se vide ensuite. */
  onSend?: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

const MAX_LENGTH = 1000;

/** Barre de saisie d'un message : champ en pilule et bouton Envoyer. */
export function MessageComposer({
  onSend,
  placeholder = 'Écris un message…',
  style,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  function send() {
    if (!canSend) return;
    onSend?.(text.trim());
    setText('');
  }

  return (
    <View style={[styles.root, style]}>
      <TextInput
        accessibilityLabel="Message"
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        cursorColor={colors.text}
        selectionColor={colors.active}
        multiline
        maxLength={MAX_LENGTH}
        style={styles.input}
      />
      <IconButton
        icon="send"
        accessibilityLabel="Envoyer"
        disabled={!canSend}
        onPress={send}
      />
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
