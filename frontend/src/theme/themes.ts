export const THEME_FILES = {
  default: "ui_kosuth.css",
  klee: "ui_klee.css",
  chirico: "ui_kiriko.css",
  malevitch: "ui_malevitch.css",
  boychuk: "ui_boychuk.css",
  ekster: "ui_ekster.css",
  calder: "ui_calder.css",
  gropius: "ui_gropius.css",
  newman: "ui_newman.css",
} as const;

export type ThemeName = keyof typeof THEME_FILES;

export const THEME_LABELS: Record<ThemeName, string> = {
  default: "Kosuth",
  klee: "Klee",
  chirico: "de Chirico",
  malevitch: "Malevich",
  boychuk: "Boychuk",
  ekster: "Ekster",
  calder: "Calder",
  gropius: "Gropius",
  newman: "Newman",

};

export const THEME_BASE_PATH = "/";

export const THEMES: Record<ThemeName, { label: string; href: string }> =
  (Object.keys(THEME_FILES) as ThemeName[]).reduce((acc, name) => {
    acc[name] = {
      label: THEME_LABELS[name],
      href: `${THEME_BASE_PATH}${THEME_FILES[name]}`,
    };
    return acc;
  }, {} as Record<ThemeName, { label: string; href: string }>);

export const THEME_ORDER: ThemeName[] = Object.keys(THEME_FILES) as ThemeName[];
