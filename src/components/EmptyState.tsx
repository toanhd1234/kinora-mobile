import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import AppText from './AppText';
import Button from './Button';
import Icon, { type IconName } from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

type Props = {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Friendly, centered empty state with an icon halo and optional CTA. */
export default function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
      style={styles.wrap}
    >
      <View style={[styles.halo, { backgroundColor: colors.primarySoft }]}>
        <Icon name={icon} size={34} color="onPrimarySoft" />
      </View>
      <AppText variant="title3" align="center" style={{ marginTop: space.lg }}>
        {title}
      </AppText>
      {description && (
        <AppText
          variant="callout"
          color="textSecondary"
          align="center"
          style={{ marginTop: space.sm, maxWidth: 300 }}
        >
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          icon="add"
          fullWidth={false}
          style={{ marginTop: space.xl }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: space.huge, paddingHorizontal: space.xl },
  halo: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
