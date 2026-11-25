import { formatDateInput } from '@/lib/dates';

import { Input, type InputProps } from './input';

export type DateInputProps = Omit<
  InputProps,
  'value' | 'onChangeText' | 'keyboardType' | 'maxLength' | 'icon' | 'trailing'
> & {
  /** Date saisie, au format « JJ / MM / AAAA ». */
  value: string;
  onChangeText: (value: string) => void;
};

/** Champ de date au clavier numérique, mis en forme « JJ / MM / AAAA » pendant la saisie. */
export function DateInput({ value, onChangeText, placeholder = 'JJ / MM / AAAA', ...rest }: DateInputProps) {
  return (
    <Input
      value={value}
      onChangeText={(text) => onChangeText(formatDateInput(text))}
      placeholder={placeholder}
      keyboardType="number-pad"
      maxLength={14}
      icon="calendar"
      {...rest}
    />
  );
}
