import { StyleSheet } from 'react-native';
import AppText from './AppText';
import PressableScale from './PressableScale';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Selectable pill used for filters / segmented choices (e.g. document type). */
export default function Chip({ label, selected = false, onPress }: Props) {
  const { colors: c } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? c.primary : c.surface,
          borderColor: selected ? c.primary : c.border,
        },
      ]}
    >
      <AppText variant="subhead" color={selected ? 'onPrimary' : 'textSecondary'} weight="600">
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
