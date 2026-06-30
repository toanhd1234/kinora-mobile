import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

type Props = {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
  style?: ViewStyle;
};

/** A single shimmering placeholder block. */
export function Skeleton({ width = '100%', height = 16, rounded = radius.sm, style }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 0.85 : 0.5);

  useEffect(() => {
    // Honour "Reduce Motion": hold a steady placeholder instead of pulsing.
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: rounded, backgroundColor: colors.skeleton },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** A card-shaped skeleton, repeated to preview a list while it loads. */
export function SkeletonCard() {
  const { colors, shadow } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg },
        shadow(1),
      ]}
    >
      <Skeleton width="55%" height={18} />
      <Skeleton width="35%" height={13} style={{ marginTop: space.sm }} />
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: space.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.lg, borderWidth: 1 },
});
