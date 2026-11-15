import { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { readAppearance, saveAppearance } from '../data/appearance';

const light = {
  paper: '#f4f0eb', card: '#fffcf8', ink: '#291942', muted: '#6a5874', border: '#e6ddd8',
  purple: '#4f1d6e', night: '#21112e', nightMuted: '#cdbbd4', orange: '#ef5a1b', action: '#a43712',
  gold: '#f8b51b', pink: '#c72c66', plum: '#7e235d', softPlum: '#efe5f3', softOrange: '#fae7db',
  actionText: '#fffaf3', success: '#315f42', successSurface: '#e6efe4', warning: '#74500d',
  warningSurface: '#faedcf', danger: '#a42642', dangerSurface: '#f9e8ec', review: '#ae710d',
  tooltip: '#21112e', tooltipText: '#fff7f0', tooltipMuted: '#cdbbd4',
};

const dark = {
  ...light,
  paper: '#181020', card: '#25192f', ink: '#faf0ff', muted: '#c6b2d0', border: '#4b3655',
  purple: '#deb2f2', night: '#160d1e', orange: '#ff9457', action: '#ffac80', pink: '#fc81b2',
  plum: '#ec9bd7', softPlum: '#40294c', softOrange: '#522e29', actionText: '#351708',
  success: '#a9dcb9', successSurface: '#223d32', warning: '#f5ca78', warningSurface: '#49351e',
  danger: '#ffa8bc', dangerSurface: '#4a2335', review: '#eeb65e', tooltip: '#f7e8f6',
  tooltipText: '#291942', tooltipMuted: '#6a5874',
};

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const systemMode = useColorScheme();
  const [preference, setPreference] = useState(null);
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState(null);
  const mode = preference ?? (systemMode === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    let active = true;
    readAppearance().then(
      (stored) => { if (active) setPreference(stored); },
      () => { if (active) setError('Could not load appearance.'); },
    ).finally(() => { if (active) setSaving(false); });
    return () => { active = false; };
  }, []);

  async function toggle() {
    if (saving) return;
    const next = mode === 'dark' ? 'light' : 'dark';
    setSaving(true);
    setError(null);
    try {
      await saveAppearance(next);
      setPreference(next);
    } catch {
      setError('Could not save appearance. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return <AppearanceContext.Provider value={{ mode, saving, error, toggle }}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const appearance = useContext(AppearanceContext);
  if (!appearance) throw new Error('AppearanceProvider is required.');
  return appearance;
}

export function useColors() {
  return useAppearance().mode === 'dark' ? dark : light;
}

export function createThemedStyles(create) {
  const styles = { light: StyleSheet.create(create(light)), dark: StyleSheet.create(create(dark)) };
  return function useThemedStyles() {
    return styles[useAppearance().mode];
  };
}
