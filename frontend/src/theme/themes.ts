export const THEME_FILES = {
  default: "ui_kiriko.css",
  judd: "ui_judd.css",
  klee: "ui_klee.css",
  kosuth: "ui_kosuth.css",
  malevitch: "ui_white.css",
  boychuk: "ui_boychuk.css",
  ekster: "ui_ekster.css",

} as const;

export type ThemeName = keyof typeof THEME_FILES;

export const THEME_LABELS: Record<ThemeName, string> = {
  default: "Kiriko",
  malevitch: "Malevitch",
  judd: "Judd",
  klee: "Klee",
  kosuth: "Kosuth",
  boychuk: "Boychuk",
  ekster: "Ekster",

};

export const THEME_BASE_PATH = "/"; // or "/themes/" if you move them later

export const THEMES: Record<ThemeName, { label: string; href: string }> = (
  Object.keys(THEME_FILES) as ThemeName[]
).reduce((acc, name) => {
  acc[name] = {
    label: THEME_LABELS[name],
    href: `${THEME_BASE_PATH}${THEME_FILES[name]}`,
  };
  return acc;
}, {} as Record<ThemeName, { label: string; href: string }>);

export const THEME_ORDER: ThemeName[] = Object.keys(THEME_FILES) as ThemeName[];
