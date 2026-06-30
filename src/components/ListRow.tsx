import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import AppText from './AppText';
import Icon, { type IconName } from './Icon';
import PressableScale from './PressableScale';
import type { ColorTokens } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Background tone of the leading icon chip. */
  iconTone?: 'primary' | 'accent' | 'neutral' | 'danger';
  onPress?: () => void;
  showChevron?: boolean;
  trailing?: ReactNode;
  destructive?: boolean;
  style?: ViewStyle;
};

const ICON_TONES: Record<NonNullable<Props['iconTone']>, { bg: keyof ColorTokens; fg: keyof ColorTokens }> = {
  primary: { bg: 'primarySoft', fg: 'onPrimarySoft' },
  accent: { bg: 'accentSoft', fg: 'onAccentSoft' },
  neutral: { bg: 'surfaceAlt', fg: 'textSecondary' },
  danger: { bg: 'dangerSoft', fg: 'onDangerSoft' },
};

/**
 * A tappable row with a tinted leading icon, title/subtitle and a chevron —
 * the building block for hub menus and settings lists (Airbnb/Settings style).
 */
export default function ListRow({
  title,
  subtitle,
  icon,
  iconTone = 'primary',
  onPress,
  showChevron = true,
  trailing,
  destructive,
  style,
}: Props) {
  const theme = useTheme();
  const c = theme.colors;
  const tone = ICON_TONES[destructive ? 'danger' : iconTone];

  const body = (
    <>
      {icon && (
        <View style={[styles.iconChip, { backgroundColor: c[tone.bg] }]}>
          <Icon name={icon} size={20} color={tone.fg} />
        </View>
      )}
      <View style={styles.text}>
        <AppText variant="headline" color={destructive ? 'danger' : 'text'}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="footnote" color="textSecondary" style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        )}
      </View>
      {trailing}
      {showChevron && onPress && <Icon name="chevron" size={20} color="textTertiary" />}
    </>
  );

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    ...theme.shadow(1),
  };

  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={[rowStyle, style]}>
        {body}
      </PressableScale>
    );
  }
  return <View style={[rowStyle, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
});
