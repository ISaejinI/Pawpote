import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  BackHandler,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAvoidingView, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { borderWidth, colors, spacing, typography } from '@/theme';

import { IconButton } from './icon-button';

export type BottomSheetProps = {
  visible: boolean;
  /** Fermeture demandée : bouton Fermer, voile, glissement vers le bas ou retour Android. */
  onClose: () => void;
  /** Appelé une fois la modale entièrement fermée (ex. pour ouvrir ensuite la galerie). */
  onClosed?: () => void;
  title: string;
  /** Sous-titre manuscrit. */
  subtitle?: string;
  footer?: ReactNode;
  /** Panneau rendu dans une superposition à la racine de l'écran, avec évitement du clavier. */
  inline?: boolean;
  children: ReactNode;
};

const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;
const SHEET_GAP = 18;
/** Distance ou vitesse de glissement vers le bas qui ferme la modale. */
const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 800;

/** Panneau ancré en bas de l'écran pour un choix rapide (ModaleBasse du design system). */
export function BottomSheet({
  visible,
  onClose,
  onClosed,
  title,
  subtitle,
  footer,
  inline = false,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const avoidKeyboard = inline && Platform.OS !== 'web';
  const bottomPadding = insets.bottom + 24;

  // La modale reste montée le temps de l'animation de fermeture
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);
  const closedNotified = useRef(true);

  function finishClosing() {
    setMounted(false);
    // Sur iOS, on attend la vraie fermeture de la Modal (`onDismiss`) avant de prévenir
    if (inline || Platform.OS !== 'ios') notifyClosed();
  }

  function notifyClosed() {
    if (closedNotified.current) return;
    closedNotified.current = true;
    onClosed?.();
  }

  useEffect(() => {
    if (visible) {
      closedNotified.current = false;
      dragY.value = 0;
      progress.value = withTiming(1, { duration: OPEN_DURATION });
    } else {
      progress.value = withTiming(0, { duration: CLOSE_DURATION }, (finished) => {
        if (finished) scheduleOnRN(finishClosing);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function requestClose() {
    if (inline) Keyboard.dismiss();
    onClose();
  }

  useEffect(() => {
    if (!inline || !visible || Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (Keyboard.isVisible()) Keyboard.dismiss();
      else onClose();
      return true;
    });
    return () => subscription.remove();
  }, [inline, visible, onClose]);

  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((event) => {
      dragY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(requestClose);
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * windowHeight + dragY.value }],
  }));

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={styles.headings}>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <IconButton icon="close" variant="white" size="sm" accessibilityLabel="Fermer" onPress={requestClose} />
      </View>
    </View>
  );

  const sheet = (
    <Animated.View
      role="dialog"
      aria-modal
      accessibilityViewIsModal
      accessibilityLabel={title}
      onAccessibilityEscape={requestClose}
      style={[
        styles.sheet,
        inline
          ? styles.keyboardSheet
          : { paddingBottom: bottomPadding, maxHeight: windowHeight - insets.top - 12 },
        sheetStyle,
      ]}
    >
      {footer ? (
        <>
          <GestureDetector gesture={pan}>{header}</GestureDetector>
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={inline ? styles.keyboardScrollContent : undefined}
            keyboardShouldPersistTaps="handled"
            bounces={avoidKeyboard ? false : undefined}
            overScrollMode={avoidKeyboard ? 'never' : undefined}
          >
            {children}
            {inline && footer}
          </ScrollView>
          {!inline && footer}
        </>
      ) : <>{header}{children}</>}
    </Animated.View>
  );

  const content = footer ? sheet : <GestureDetector gesture={pan}>{sheet}</GestureDetector>;
  const backdrop = (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={requestClose}
        accessible={!inline}
        accessibilityRole="button"
        accessibilityLabel="Fermer"
      />
    </Animated.View>
  );

  if (inline) {
    if (!mounted) return null;
    return (
      <GestureHandlerRootView
        style={[StyleSheet.absoluteFill, styles.overlay]}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      >
        {backdrop}
        {avoidKeyboard ? <KeyboardSheetFrame>{content}</KeyboardSheetFrame> : content}
      </GestureHandlerRootView>
    );
  }

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      onDismiss={notifyClosed}
    >
      <GestureHandlerRootView style={styles.root}>
        {backdrop}
        {content}
      </GestureHandlerRootView>
    </Modal>
  );
}

function KeyboardSheetFrame({ children }: { children: ReactNode }) {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const safeBottom = useAnimatedStyle(() => ({
    paddingBottom: bottom * (1 - Math.min(1, Math.max(0, progress.value))),
  }));

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding" pointerEvents="box-none">
      <Animated.View
        style={[styles.root, { paddingTop: top + spacing[3], paddingLeft: left, paddingRight: right }, safeBottom]}
        pointerEvents="box-none"
      >
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    // Voile ink à 55 %
    backgroundColor: 'rgba(30, 18, 64, 0.55)',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: SHEET_GAP,
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderTopWidth: borderWidth.regular,
    borderLeftWidth: borderWidth.regular,
    borderRightWidth: borderWidth.regular,
    borderColor: colors.border,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.text,
    opacity: 0.3,
  },
  headerBlock: {
    gap: 14,
  },
  overlay: {
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  keyboardSheet: {
    flexShrink: 1,
    maxHeight: '100%',
    gap: spacing[3],
    paddingBottom: spacing[3],
  },
  keyboardScrollContent: {
    gap: spacing[3],
  },
  scrollBody: {
    flexGrow: 0,
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headings: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.titleLg,
    fontSize: 26,
    lineHeight: 27,
    color: colors.text,
  },
  subtitle: {
    ...typography.handLg,
    fontSize: 19,
    lineHeight: 22,
    color: colors.text,
  },
});
