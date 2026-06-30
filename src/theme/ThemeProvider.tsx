import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, type ColorTokens } from './colors';
import { elevation, motion, radius, space, spacing, typography } from './tokens';

const THEME_PREF_KEY = '@kinora/theme-preference';

function isThemePreference(v: unknown): v is ThemePreference {
  return v === 'system' || v === 'light' || v === 'dark';
}

export type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export type Theme = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: ColorTokens;
  space: typeof space;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  /** Elevation preset bound to the current scheme's shadow colour. */
  shadow: (level: 0 | 1 | 2 | 3) => object;
};

type ThemeContextValue = Theme & {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function buildTheme(scheme: ColorScheme): Theme {
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return {
    scheme,
    isDark: scheme === 'dark',
    colors,
    space,
    spacing,
    radius,
    typography,
    motion,
    shadow: (level) => elevation(level, colors.shadow),
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Hydrate the saved preference once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_PREF_KEY)
      .then((stored) => {
        if (active && isThemePreference(stored)) setPreferenceState(stored);
      })
      .catch(() => {
        // ignore — fall back to the default 'system'
      });
    return () => {
      active = false;
    };
  }, []);

  // Update state immediately and persist in the background.
  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(THEME_PREF_KEY, p).catch(() => {});
  }, []);

  const scheme: ColorScheme =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({ ...buildTheme(scheme), preference, setPreference }),
    [scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

/** Access (and change) the user's light/dark/system preference. */
export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used within a ThemeProvider');
  return { preference: ctx.preference, setPreference: ctx.setPreference, scheme: ctx.scheme };
}

/**
 * Build a StyleSheet from a factory that receives the theme. Memoised per
 * scheme so styles only recompute when light/dark actually flips.
 */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme]);
}
