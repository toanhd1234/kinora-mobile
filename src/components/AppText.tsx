import { Text, type TextProps, type TextStyle } from 'react-native';
import type { ColorTokens } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import type { TypographyVariant } from '../theme/tokens';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: keyof ColorTokens | (string & {});
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
};

/**
 * The single text primitive. Picks size/weight/tracking from the type scale and
 * colour from the theme, so no screen hardcodes font metrics or hex values.
 */
export default function AppText({
  variant = 'body',
  color = 'text',
  align,
  weight,
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const resolvedColor =
    (theme.colors as Record<string, string>)[color as string] ?? (color as string);

  return (
    <Text
      style={[
        theme.typography[variant] as TextStyle,
        { color: resolvedColor },
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...rest}
    />
  );
}
