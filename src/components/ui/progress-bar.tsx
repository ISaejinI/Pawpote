import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, typography } from '@/theme';

import { Icon } from './icon';

export type ProgressBarProps = {
  /** Avancement entre 0 et 1. */
  value: number;
  /**
   * - `lg` : onboarding, piste 16 px et patte qui avance au bout du remplissage.
   * - `mini` : complétion d'un profil de chien, piste 10 px et libellé à droite.
   */
  size?: 'lg' | 'mini';
  /** Nom lu par les lecteurs d'écran (ex. « Progression de l'inscription »). */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const PAW_SIZE = 34;

/** Barre qui se remplit (BarreProgression du design system). */
export function ProgressBar({
  value,
  size = 'lg',
  accessibilityLabel,
  style,
}: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const a11y = {
    accessibilityRole: 'progressbar' as const,
    accessibilityLabel,
    accessibilityValue: { min: 0, max: 100, now: percent },
  };

  if (size === 'mini') {
    const complete = percent === 100;

    return (
      <View style={[styles.miniRow, style]} {...a11y}>
        <View style={styles.miniTrack}>
          <View
            style={[
              styles.miniFill,
              { width: `${percent}%`, backgroundColor: complete ? colors.lime500 : colors.active },
            ]}
          />
        </View>
        <Text style={styles.miniLabel}>
          {complete ? 'Profil complet' : `Complété à ${percent} %`}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.lg, style]} {...a11y}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      {/* La patte avance au bout du remplissage */}
      <View style={[styles.paw, { left: `${percent}%` }]} pointerEvents="none">
        <Icon
          name="paw"
          size={20}
          color={colors.mandarin600}
          outlineColor={colors.text}
          strokeWidth={1.5}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lg: {
    height: PAW_SIZE,
    justifyContent: 'center',
  },
  track: {
    height: 16,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.active,
    borderRightWidth: borderWidth.regular,
    borderRightColor: colors.border,
  },
  paw: {
    position: 'absolute',
    top: 0,
    width: PAW_SIZE,
    height: PAW_SIZE,
    marginLeft: -(PAW_SIZE / 2 + 1),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.active,
    borderWidth: borderWidth.regular,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.field,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
  },
  miniLabel: {
    ...typography.small,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: 800,
    color: colors.text,
  },
});
