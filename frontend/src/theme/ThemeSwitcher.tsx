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
        .tabsWithTools > .nav-item:last-child {
          flex: 0 0 auto !important;
          min-width: 0 !important;
          margin-left: auto !important;
          position: relative !important;
          right: auto !important;
          z-index: 5 !important;
        }

        .tabsWithTools .tabsTool {
          position: static !important;
          right: auto !important;
          flex: 0 0 auto !important;
          min-width: 0 !important;
          max-width: none !important;
          margin-left: 0.5rem !important;
          padding-left: 0 !important;
          overflow: visible !important;
          background: transparent !important;
        }

        .themeSwitch[data-theme-vocabulary] {
          box-sizing: border-box !important;
          flex: 0 0 9.25rem !important;
          width: 9.25rem !important;
          min-width: 9.25rem !important;
          max-width: 9.25rem !important;
          height: 2.75rem !important;
          min-height: 2.75rem !important;
          max-height: 2.75rem !important;
          padding: 0 0.55rem !important;
          overflow: hidden !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 0.8rem !important;
          line-height: 1 !important;
          letter-spacing: 0.035em !important;
          white-space: nowrap !important;
        }

        .themeSwitch[data-theme-vocabulary="soviet"] {
          font-size: 0.95rem !important;
          letter-spacing: 0.01em !important;
        }

        .themeSwitch[data-theme-vocabulary]::before,
        .themeSwitch[data-theme-vocabulary]::after {
          display: none !important;
          content: none !important;
        }

        .themeSwitch[data-theme-vocabulary] .themeSwitch__label {
          display: block !important;
          position: relative !important;
          z-index: 1 !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          overflow: visible !important;
          text-overflow: clip !important;
          white-space: nowrap !important;
          text-align: center !important;
          font-size: inherit !important;
          line-height: inherit !important;
          letter-spacing: inherit !important;
        }

        @media (max-width: 576px) {
          .tabsWithTools > .nav-item:last-child {
            margin-left: 0 !important;
          }

          .tabsWithTools .tabsTool {
            margin-left: 0.35rem !important;
          }

          .themeSwitch[data-theme-vocabulary] {
            flex-basis: 8.6rem !important;
            width: 8.6rem !important;
            min-width: 8.6rem !important;
            max-width: 8.6rem !important;
            height: 2.5rem !important;
            min-height: 2.5rem !important;
            max-height: 2.5rem !important;
            padding: 0 0.4rem !important;
            font-size: 0.76rem !important;
            letter-spacing: 0.025em !important;
          }

          .themeSwitch[data-theme-vocabulary="soviet"] {
            font-size: 0.88rem !important;
            letter-spacing: 0 !important;
          }
        }

        @media (max-width: 360px) {
          .themeSwitch[data-theme-vocabulary] {
            flex-basis: 8.2rem !important;
            width: 8.2rem !important;
            min-width: 8.2rem !important;
            max-width: 8.2rem !important;
            font-size: 0.74rem !important;
            letter-spacing: 0.015em !important;
          }

          .themeSwitch[data-theme-vocabulary="soviet"] {
            font-size: 0.84rem !important;
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
