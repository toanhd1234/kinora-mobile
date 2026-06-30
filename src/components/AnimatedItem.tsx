import { type ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { motion } from '../theme/tokens';

type Props = {
  children: ReactNode;
  /** List index — used to stagger the entrance. */
  index?: number;
  style?: ViewStyle;
};

/**
 * Wraps a list item so it fades + slides up on mount, staggered by index.
 * Capped so long lists don't accumulate huge delays.
 */
export default function AnimatedItem({ children, index = 0, style }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.duration.base)
        .delay(Math.min(index, 8) * 55)
        .reduceMotion(ReduceMotion.System)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
