import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '../base/icon';
import { Input, type InputProps } from './input';

export type PasswordInputProps = Omit<
  InputProps,
  'secureTextEntry' | 'trailing' | 'icon'
>;

/** Champ masqué avec un bouton œil de 44 px pour afficher ou masquer le mot de passe. */
export function PasswordInput({
  autoCapitalize = 'none',
  autoCorrect = false,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      secureTextEntry={!visible}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      trailing={
        <Pressable
          onPress={() => setVisible((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={
            visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
          }
          style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={22} />
        </Pressable>
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
