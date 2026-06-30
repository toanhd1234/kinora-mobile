import { Ionicons } from '@expo/vector-icons';
import type { ColorTokens } from '../theme/colors';
import { iconSize, type IconSize } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Semantic icon names used across Kinora, mapped to Ionicons glyphs in one
 * place. Screens reference roles ("meds", "appointments") not raw glyph names,
 * so we can re-skin the icon set globally later.
 */
const GLYPHS = {
  // domains
  meds: 'medical-outline',
  interactions: 'shield-checkmark-outline',
  explain: 'sparkles-outline',
  appointments: 'calendar-outline',
  documents: 'folder-open-outline',
  team: 'people-outline',
  recipient: 'heart-circle-outline',
  // actions
  add: 'add',
  back: 'chevron-back',
  chevron: 'chevron-forward',
  close: 'close',
  settings: 'settings-outline',
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  camera: 'camera-outline',
  image: 'image-outline',
  mic: 'mic-outline',
  stop: 'stop-circle-outline',
  trash: 'trash-outline',
  refresh: 'refresh',
  upload: 'cloud-upload-outline',
  attach: 'document-attach-outline',
  download: 'download-outline',
  lock: 'lock-closed-outline',
  logout: 'log-out-outline',
  mail: 'mail-outline',
  doctor: 'person-outline',
  clock: 'time-outline',
  premium: 'sparkles',
  warning: 'warning-outline',
  info: 'information-circle-outline',
  pill: 'ellipse-outline',
  sun: 'sunny-outline',
  moon: 'moon-outline',
} as const;

export type IconName = keyof typeof GLYPHS;

type Props = {
  name: IconName;
  /** A token from the `iconSize` scale, or an explicit number. */
  size?: IconSize | number;
  /** A colour token, or an explicit hex. Defaults to primary text colour. */
  color?: keyof ColorTokens | (string & {});
  /**
   * When set, the icon is exposed to screen readers as an image with this
   * label (use for icons that carry meaning on their own). When omitted, the
   * icon is treated as decorative and hidden from the a11y tree so VoiceOver /
   * TalkBack don't announce glyph noise.
   */
  accessibilityLabel?: string;
  style?: object;
};

export default function Icon({ name, size = 22, color = 'text', accessibilityLabel, style }: Props) {
  const { colors } = useTheme();
  const resolved = (colors as Record<string, string>)[color as string] ?? (color as string);
  const resolvedSize = typeof size === 'number' ? size : iconSize[size];
  const meaningful = accessibilityLabel != null;
  return (
    <Ionicons
      name={GLYPHS[name]}
      size={resolvedSize}
      color={resolved}
      style={style}
      accessible={meaningful}
      accessibilityElementsHidden={!meaningful}
      importantForAccessibility={meaningful ? 'yes' : 'no-hide-descendants'}
      accessibilityRole={meaningful ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
