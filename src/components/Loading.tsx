import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

/** Centered full-screen spinner with an optional caption. */
export default function Loading({ label }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label && (
        <AppText variant="footnote" color="textSecondary" style={{ marginTop: space.md }}>
          {label}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
