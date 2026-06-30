import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import AppText from './AppText';
import Icon, { type IconName } from './Icon';
import PressableScale from './PressableScale';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radius, space } from '../theme/tokens';

type Props = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  /** Extra bottom offset to clear the safe-area inset. */
  bottomInset?: number;
};

/**
 * Floating primary action pinned to the bottom of a list screen. Wide pill so
 * it's an easy one-handed thumb target.
 */
export default function FAB({ label, icon = 'add', onPress, bottomInset = 0 }: Props) {
  const theme = useTheme();
  return (
    <Animated.View
      entering={FadeInUp.duration(280).reduceMotion(ReduceMotion.System)}
      style={[styles.wrap, { bottom: space.lg + bottomInset }]}
      pointerEvents="box-none"
    >
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary, borderRadius: radius.pill },
          theme.shadow(3),
        ]}
      >
        <Icon name={icon} size={22} color="onPrimary" />
        <AppText variant="headline" color="onPrimary" weight="700">
          {label}
        </AppText>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center' },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: MIN_TOUCH + 4,
    paddingHorizontal: space.xl,
    alignSelf: 'stretch',
  },
});
