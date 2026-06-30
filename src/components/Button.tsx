import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import AppText from './AppText';
import Icon, { type IconName } from './Icon';
import PressableScale from './PressableScale';
import type { ColorTokens } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radius, space } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'tinted' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const SIZES: Record<Size, { padV: number; padH: number; font: 'subhead' | 'headline'; icon: number }> = {
  sm: { padV: 9, padH: 14, font: 'subhead', icon: 18 },
  md: { padV: 13, padH: 18, font: 'headline', icon: 20 },
  lg: { padV: 16, padH: 22, font: 'headline', icon: 22 },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = true,
  style,
}: Props) {
  const theme = useTheme();
  const c = theme.colors;
  const s = SIZES[size];

  const palette: Record<Variant, { bg: string; fg: keyof ColorTokens; border?: string }> = {
    primary: { bg: c.primary, fg: 'onPrimary' },
    secondary: { bg: c.surface, fg: 'text', border: c.borderStrong },
    tinted: { bg: c.primarySoft, fg: 'onPrimarySoft' },
    ghost: { bg: 'transparent', fg: 'primary' },
    danger: { bg: c.danger, fg: 'textInverse' },
  };
  const p = palette[variant];
  const isBlocked = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: p.bg,
          paddingVertical: s.padV,
          paddingHorizontal: s.padH,
          borderRadius: radius.md,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'primary' || variant === 'danger' ? theme.shadow(1) : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c[p.fg]} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon name={icon} size={s.icon} color={p.fg} />}
          <AppText variant={s.font} color={p.fg} weight="600">
            {title}
          </AppText>
          {iconRight && <Icon name={iconRight} size={s.icon} color={p.fg} />}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
