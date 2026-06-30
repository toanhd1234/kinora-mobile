/**
 * Semantic colour palettes for light & dark mode.
 *
 * Components NEVER hardcode hex — they read `theme.colors.<token>` so the same
 * component renders correctly in both schemes. The token names describe *role*
 * (surface, textSecondary, danger…) not appearance, so dark mode is a pure
 * data swap.
 *
 * Kinora's brand: deep forest green + warm cream + clay accent — a calm,
 * trustworthy palette suited to a healthcare/care-coordination product.
 */
export type ColorTokens = {
  // Backgrounds
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceSunken: string;

  // Lines & separators
  border: string;
  borderStrong: string;
  hairline: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Disabled (controls + their content)
  disabled: string;
  onDisabled: string;

  // Brand / primary
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  onPrimarySoft: string;

  // Accent (clay)
  accent: string;
  accentSoft: string;
  onAccentSoft: string;

  // Status
  success: string;
  successSoft: string;
  onSuccessSoft: string;
  warning: string;
  warningSoft: string;
  onWarningSoft: string;
  danger: string;
  dangerSoft: string;
  onDangerSoft: string;
  info: string;
  infoSoft: string;
  onInfoSoft: string;

  // Misc
  shadow: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
  focusRing: string;
};

export const lightColors: ColorTokens = {
  bg: '#F6F4EC',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EEE3',
  surfaceSunken: '#ECEADF',

  border: '#E4E1D5',
  borderStrong: '#D4D0C1',
  hairline: '#ECE9DE',

  text: '#1B2A20',
  textSecondary: '#586860',
  // Darkened from #8A938B so 12–13px text clears WCAG 2.2 AA (≥4.5:1) on both
  // the cream bg (#F6F4EC) and white surfaces — used for captions/hints/legal.
  textTertiary: '#656E66',
  textInverse: '#FFFFFF',

  disabled: '#E8E5D9',
  onDisabled: '#A2AAA2',

  primary: '#1F3D2B',
  primaryPressed: '#16301F',
  primarySoft: '#E6F0E9',
  onPrimary: '#FFFFFF',
  onPrimarySoft: '#1F3D2B',

  accent: '#9A5746',
  accentSoft: '#F7EAE4',
  onAccentSoft: '#7E4234',

  success: '#1F7A4D',
  successSoft: '#E2F1E8',
  onSuccessSoft: '#155C39',
  warning: '#B26B2E',
  warningSoft: '#FBEEDF',
  onWarningSoft: '#8A4B22',
  danger: '#B3261E',
  dangerSoft: '#FBE6E4',
  onDangerSoft: '#8E1D17',
  info: '#2E5E8A',
  infoSoft: '#E4EDF6',
  onInfoSoft: '#234A6D',

  shadow: '#1B2A20',
  overlay: 'rgba(20, 30, 24, 0.45)',
  skeleton: '#EAE7DB',
  skeletonHighlight: '#F4F2EA',
  focusRing: 'rgba(31, 61, 43, 0.35)',
};

export const darkColors: ColorTokens = {
  bg: '#0E1410',
  surface: '#171F19',
  surfaceAlt: '#1E2821',
  surfaceSunken: '#10160F',

  border: '#2A352D',
  borderStrong: '#384A3D',
  hairline: '#222D26',

  text: '#ECF1ED',
  textSecondary: '#A6B2AA',
  // Lightened from #74807A so small text clears AA (≥4.5:1) on dark surfaces.
  textTertiary: '#8A958E',
  textInverse: '#10160F',

  disabled: '#222D26',
  onDisabled: '#5C665F',

  primary: '#5FBE8A',
  primaryPressed: '#52A878',
  primarySoft: '#1C2C22',
  onPrimary: '#08130C',
  onPrimarySoft: '#8FD9AE',

  accent: '#D69479',
  accentSoft: '#2C211C',
  onAccentSoft: '#E9B6A2',

  success: '#5BC487',
  successSoft: '#16271D',
  onSuccessSoft: '#8FD9AE',
  warning: '#D79B5A',
  warningSoft: '#2A2014',
  onWarningSoft: '#E8BB85',
  danger: '#E2675F',
  dangerSoft: '#2C1715',
  onDangerSoft: '#F0A39D',
  info: '#7FB0DD',
  infoSoft: '#15212C',
  onInfoSoft: '#A8CBEC',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: '#1E2821',
  skeletonHighlight: '#28352C',
  focusRing: 'rgba(95, 190, 138, 0.4)',
};
