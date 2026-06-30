import { type ReactNode, useState } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { hitSlop, motion } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far to scale down on press. Defaults to the global press token. */
  scaleTo?: number;
  /** Also dims to this opacity while pressed. */
  dimTo?: number;
  haptic?: boolean;
};

/**
 * A Pressable that springs down on touch — the tactile feedback that makes the
 * whole app feel native. Built on Reanimated so the animation runs on the UI
 * thread and never drops a frame.
 */
export default function PressableScale({
  children,
  style,
  scaleTo = motion.pressScale,
  dimTo = 1,
  disabled,
  onPress,
  accessibilityRole,
  accessibilityState,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);
  const [focused, setFocused] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(1 - pressed.value * (1 - scaleTo), {
          duration: motion.duration.instant,
        }),
      },
    ],
    opacity: withTiming(1 - pressed.value * (1 - dimTo), {
      duration: motion.duration.instant,
    }),
  }));

  // A pressable that does something is a button for assistive tech, unless the
  // caller intentionally set another role. Saves every Card/ListRow call site
  // from re-declaring it.
  const resolvedRole = accessibilityRole ?? (onPress ? 'button' : undefined);

  // Keyboard-focus ring on web only (focusRing token), so Tab navigation is
  // visible. No-op on native, where focus rings aren't a thing.
  const focusRingStyle: ViewStyle | null =
    Platform.OS === 'web' && focused
      ? ({ outlineStyle: 'solid', outlineWidth: 2, outlineColor: colors.focusRing, outlineOffset: 2 } as ViewStyle)
      : null;

  return (
    <AnimatedPressable
      hitSlop={hitSlop}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole={resolvedRole}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      onPressIn={() => (pressed.value = 1)}
      onPressOut={() => (pressed.value = 0)}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[style, animatedStyle, focusRingStyle, disabled ? { opacity: 0.5 } : null]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
