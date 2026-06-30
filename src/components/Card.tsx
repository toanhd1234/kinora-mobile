import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import PressableScale from './PressableScale';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  /** 0 = flat (border only), 1 = resting card, 2 = raised. */
  elevation?: 0 | 1 | 2;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'alt';
};

/**
 * The base container for grouped content. Border + soft shadow give a premium,
 * Notion/Linear-style card. Pass `onPress` to make the whole card a spring
 * button.
 */
export default function Card({
  children,
  onPress,
  elevation = 1,
  padded = true,
  style,
  tone = 'surface',
}: Props) {
  const theme = useTheme();
  const c = theme.colors;

  const cardStyle: ViewStyle = {
    backgroundColor: tone === 'alt' ? c.surfaceAlt : c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    padding: padded ? space.lg : 0,
    ...theme.shadow(elevation),
  };

  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={[cardStyle, style]}>
        {children}
      </PressableScale>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
}
