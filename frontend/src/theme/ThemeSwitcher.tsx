import React from "react";
import { THEMES, THEME_ORDER, type ThemeName } from "./themes";
import { applyThemeHref } from "./applyTheme";

const STORAGE_KEY = "theme";

function nextTheme(current: ThemeName): ThemeName {
  const i = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(i + 1) % THEME_ORDER.length];
}

function getInitialTheme(): ThemeName {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return saved && saved in THEMES ? saved : THEME_ORDER[0];
}

export function ThemeSwitcher() {
  const [theme, setTheme] = React.useState<ThemeName>(getInitialTheme);

  React.useEffect(() => {
    applyThemeHref(THEMES[theme].href);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const label = THEMES[theme].label;

  return (
    <button
      type="button"
      className="themeSwitch"
      onClick={() => setTheme((t) => nextTheme(t))}
      aria-label={`Theme switcher (current: ${label})`}
      title={`Theme: ${label}`}
    >
      <span className="themeSwitch__label">{label}</span>
    </button>
  );
}
