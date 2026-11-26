import type { TabTriggerSlotProps } from 'expo-router/ui';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderWidth, colors, palette, radius, spacing, typography } from '@/theme';

import { Icon } from './icon';
import type { IconName } from './icons';

const TAPBAR_HEIGHT = 84;
const TAPBAR_MARGIN = spacing[4];

/** Distance entre le bas de l'écran et la Tapbar : 16 px, ou la zone sûre si elle est plus grande. */
function useTapbarBottom() {
  const { bottom } = useSafeAreaInsets();
  return Math.max(bottom, TAPBAR_MARGIN);
}

/**
 * Espace à réserver en bas d'un écran à onglet pour que le contenu
 * puisse défiler entièrement au-dessus de la Tapbar.
 */
export function useTapbarInset() {
  return useTapbarBottom() + TAPBAR_HEIGHT + spacing[5];
}

/**
 * Boîte de la Tapbar, fixée en bas de l'écran.
 * À utiliser comme enfant de `<TabList asChild>` (expo-router/ui).
 */
export function Tapbar({ style, ...rest }: ViewProps) {
  const bottom = useTapbarBottom();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { bottom }, style]}
      {...rest}
    />
  );
}

// `ref` est exclu : son type dans expo-router ne correspond pas à celui de Pressable
export type TapbarTabProps = Omit<TabTriggerSlotProps, 'ref'> & {
  /** Illustration de l'onglet (40 px). */
  icon: IconName;
  label: string;
};

/**
 * Un onglet de la Tapbar : illustration dans un rond de 54 px, libellé dessous.
 * À utiliser comme enfant de `<TabTrigger asChild>` qui lui fournit `isFocused` et `onPress`.
 */
export function TapbarTab({
  icon,
  label,
  isFocused = false,
  style,
  ...rest
}: TapbarTabProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      // TabTrigger injecte son propre style (flexDirection: 'row') :
      // la mise en page de l'onglet passe après pour garder le libellé sous l'icône
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        styles.tab,
        state.pressed && styles.tabPressed,
      ]}
      {...rest}
    >
      <View style={[styles.ring, isFocused && styles.ringActive]}>
        <Icon name={icon} size={40} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    zIndex: 1,
    left: TAPBAR_MARGIN,
    right: TAPBAR_MARGIN,
    height: TAPBAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[2],
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.xl,
    // Ombre propre à la Tapbar dans le design system (5 px)
    boxShadow: `5px 5px 0 ${palette.ink}`,
  },
  tab: {
    width: 96,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabPressed: {
    transform: [{ scale: 0.95 }],
  },
  ring: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    borderWidth: borderWidth.regular,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringActive: {
    backgroundColor: colors.active,
    borderColor: colors.border,
  },
  label: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 14,
    color: colors.text,
  },
});
