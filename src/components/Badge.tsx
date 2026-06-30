import { StyleSheet, View, type ViewStyle } from 'react-native';
import AppText from './AppText';
import Icon, { type IconName } from './Icon';
import type { ColorTokens } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

type Props = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  style?: ViewStyle;
};

const TONES: Record<BadgeTone, { bg: keyof ColorTokens; fg: keyof ColorTokens }> = {
  neutral: { bg: 'surfaceAlt', fg: 'textSecondary' },
  primary: { bg: 'primarySoft', fg: 'onPrimarySoft' },
  success: { bg: 'successSoft', fg: 'onSuccessSoft' },
  warning: { bg: 'warningSoft', fg: 'onWarningSoft' },
  danger: { bg: 'dangerSoft', fg: 'onDangerSoft' },
  info: { bg: 'infoSoft', fg: 'onInfoSoft' },
  accent: { bg: 'accentSoft', fg: 'onAccentSoft' },
};

/** Compact status pill — e.g. "Premium", "Pending", "Daily". */
export default function Badge({ label, tone = 'neutral', icon, style }: Props) {
  const { colors } = useTheme();
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors[t.bg] }, style]}>
      {icon && <Icon name={icon} size={13} color={t.fg} />}
      <AppText variant="caption" color={t.fg} weight="600">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
});
