import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import AppText from './AppText';
import Icon, { type IconName } from './Icon';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radius, space } from '../theme/tokens';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  /** Show a positive/validated state (green border + optional note). */
  success?: string | boolean;
  icon?: IconName;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
};

/**
 * Labelled text input with an animated focus ring and inline error/hint slot.
 * Grows to a comfortable min touch height and respects multiline.
 */
const Input = forwardRef<TextInput, Props>(function Input(
  {
    label,
    hint,
    error,
    success,
    icon,
    required,
    disabled,
    containerStyle,
    multiline,
    style,
    onFocus,
    onBlur,
    editable,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const c = theme.colors;
  const [focused, setFocused] = useState(false);

  const isEditable = editable !== false && !disabled;
  const successText = typeof success === 'string' ? success : undefined;
  const borderColor = error
    ? c.danger
    : success
      ? c.success
      : focused
        ? c.primary
        : c.border;

  // Build a self-describing label so the field is intelligible to a screen
  // reader even though the visual <label> is a separate node.
  const a11yLabel = label ? `${label}${required ? ', required' : ''}` : undefined;

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <AppText variant="subhead" color="textSecondary">
            {label}
          </AppText>
          {required && (
            <AppText variant="subhead" color="danger" accessibilityElementsHidden>
              {' '}
              *
            </AppText>
          )}
        </View>
      )}
      <View
        style={[
          styles.field,
          {
            backgroundColor: disabled ? c.disabled : c.surface,
            borderColor,
            borderRadius: radius.md,
            borderWidth: focused || error || success ? 1.5 : 1,
            paddingVertical: multiline ? space.md : 0,
            minHeight: multiline ? 96 : MIN_TOUCH,
            alignItems: multiline ? 'flex-start' : 'center',
          },
          focused && !error && !success ? { shadowColor: c.focusRing, ...theme.shadow(1) } : null,
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={disabled ? 'onDisabled' : 'textTertiary'}
            style={{ marginTop: multiline ? 2 : 0 }}
          />
        )}
        <TextInput
          ref={ref}
          editable={isEditable}
          multiline={multiline}
          placeholderTextColor={c.textTertiary}
          selectionColor={c.primary}
          accessibilityLabel={a11yLabel}
          accessibilityHint={error ?? hint}
          accessibilityState={{ disabled: !!disabled }}
          style={[
            styles.input,
            theme.typography.body,
            { color: disabled ? c.onDisabled : c.text, textAlignVertical: multiline ? 'top' : 'center' },
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {(error || successText || hint) && (
        <AppText
          variant="footnote"
          color={error ? 'danger' : successText ? 'success' : 'textTertiary'}
          style={styles.note}
          // Announce validation changes the moment they appear, without moving focus.
          accessibilityLiveRegion={error || successText ? 'polite' : 'none'}
        >
          {error ?? successText ?? hint}
        </AppText>
      )}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  wrap: { marginBottom: space.lg },
  labelRow: { flexDirection: 'row', marginBottom: space.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  input: { flex: 1, paddingVertical: 0 },
  note: { marginTop: 6, marginLeft: 2 },
});
