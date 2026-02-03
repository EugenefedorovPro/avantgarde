const LINK_ID = "theme-css";

export function applyThemeHref(href: string) {
  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  link.href = href;
}
