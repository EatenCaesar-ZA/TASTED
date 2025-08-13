/**
 * ThemeSwitcher.tsx — Let users choose one of three color themes
 *
 * Themes map to CSS classes on the <html> element: theme-red, theme-amber, theme-teal
 * Choice persists to localStorage under 'tasted-theme'
 */
import React, { useEffect, useState } from 'react';

type ThemeName = 'theme-red' | 'theme-amber' | 'theme-teal';

const THEME_STORAGE_KEY = 'tasted-theme';

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.classList.remove('theme-red', 'theme-amber', 'theme-teal');
  root.classList.add(theme);
}

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<ThemeName>('theme-amber');

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null);
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      applyTheme('theme-amber');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  return (
    <div aria-label="Theme selector" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Theme:</span>
      <button onClick={() => setTheme('theme-red')} style={{ borderColor: 'var(--border)' }} aria-pressed={theme==='theme-red'}>Red</button>
      <button onClick={() => setTheme('theme-amber')} style={{ borderColor: 'var(--border)' }} aria-pressed={theme==='theme-amber'}>Amber</button>
      <button onClick={() => setTheme('theme-teal')} style={{ borderColor: 'var(--border)' }} aria-pressed={theme==='theme-teal'}>Teal</button>
    </div>
  );
};

export default ThemeSwitcher;




