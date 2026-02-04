import { THEMES, THEME_ORDER, type ThemeName } from "./themes";
import { applyThemeHref } from "./applyTheme";

const STORAGE_KEY = "theme";

(function bootTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    const theme: ThemeName = saved && saved in THEMES ? saved : THEME_ORDER[0];

    applyThemeHref(THEMES[theme].href);
  } catch {
    // keep default css
  }
})();
