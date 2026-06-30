import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { space } from '../theme/tokens';

type Props = {
  children: ReactNode;
  /** Wrap content in a ScrollView (with keyboard-aware padding). */
  scroll?: boolean;
  /** Horizontal + vertical padding around the content. */
  padded?: boolean;
  edges?: Edge[];
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  refreshControl?: ScrollViewProps['refreshControl'];
};

/**
 * Standard screen frame: themed background, safe-area insets and optional
 * keyboard-avoiding scroll. Every screen renders inside one of these so
 * padding, insets and background are consistent app-wide.
 */
export default function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  contentContainerStyle,
  style,
  refreshControl,
}: Props) {
  const { colors } = useTheme();
  const pad = padded ? { padding: space.lg } : null;

  const inner = scroll ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[pad, { paddingBottom: space.huge }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  ) : (
    <View style={[styles.flex, pad, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.bg }, style]}>
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
