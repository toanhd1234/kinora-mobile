/**
 * Design tokens — the primitive scales every component and screen draws from.
 * Colours live in `colors.ts`; everything else (space, type, radius, motion)
 * is colour-independent and lives here.
 */
import { Platform, type TextStyle } from 'react-native';

/** 4-pt spacing scale. Use `spacing(n)` for arbitrary multiples of 4. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const spacing = (n: number) => n * 4;

/** Corner radii. `pill` is intentionally huge so it rounds any height fully. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

/** Standardised icon sizes. Prefer these over arbitrary numbers. */
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

export type IconSize = keyof typeof iconSize;

/** Minimum comfortable touch target (Apple HIG / Material both ≈44–48). */
export const MIN_TOUCH = 48;

/**
 * Type scale. Each entry is a ready-to-spread TextStyle (size + line-height +
 * weight + tracking). `AppText` maps its `variant` prop onto these.
 */
export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.5 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  title3: { fontSize: 19, lineHeight: 25, fontWeight: '600', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  callout: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  subhead: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Motion tokens shared by Reanimated transitions across the app. */
export const motion = {
  duration: { instant: 120, fast: 180, base: 240, slow: 320 },
  spring: { damping: 18, stiffness: 200, mass: 1 },
  springSoft: { damping: 20, stiffness: 140, mass: 1 },
  pressScale: 0.97,
} as const;

/**
 * Elevation presets. Returns a style object given a shadow colour so dark mode
 * can use a deeper/neutral shadow. Android falls back to `elevation`.
 */
export function elevation(level: 0 | 1 | 2 | 3, shadowColor: string) {
  const map = {
    0: { radius: 0, y: 0, opacity: 0, elevation: 0 },
    1: { radius: 8, y: 2, opacity: 0.06, elevation: 2 },
    2: { radius: 16, y: 6, opacity: 0.1, elevation: 6 },
    3: { radius: 28, y: 12, opacity: 0.16, elevation: 12 },
  } as const;
  const e = map[level];
  if (e.elevation === 0) return {};
  return Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: e.y },
      shadowOpacity: e.opacity,
      shadowRadius: e.radius,
    },
    android: { elevation: e.elevation, shadowColor },
    default: {},
  }) as object;
}
