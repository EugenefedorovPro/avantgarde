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
    <>
      <style>{`
        .themeSwitch[data-theme-vocabulary] {
          min-width: 0 !important;
          max-width: min(11rem, 42vw) !important;
          width: auto !important;
          padding-inline: 0.65rem !important;
          overflow: hidden !important;
        }

        .themeSwitch[data-theme-vocabulary] .themeSwitch__label {
          display: block !important;
          min-width: 0 !important;
          max-width: 100% !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .themeSwitch[data-theme-vocabulary="soviet"]::before {
          display: none !important;
          content: none !important;
        }

        @media (max-width: 576px) {
          .themeSwitch[data-theme-vocabulary] {
            max-width: min(8.25rem, 38vw) !important;
            padding-inline: 0.45rem !important;
            font-size: clamp(0.66rem, 2.8vw, 0.78rem) !important;
            letter-spacing: 0.02em !important;
          }
        }
      `}</style>
      <button
        type="button"
        className="themeSwitch"
        data-theme-vocabulary={theme}
        onClick={() => setTheme((t) => nextTheme(t))}
        aria-label={`Theme switcher (current: ${label})`}
        title={`Theme: ${label}`}
      >
        <span className="themeSwitch__label">{label}</span>
      </button>
    </>
  );
}
