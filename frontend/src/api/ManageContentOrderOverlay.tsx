import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchContentOrder } from "./fetchContentOrder";
import type { ContentDirection } from "./fetchContentOrder";

const STORAGE_KEY = "htmlName";

function contentSlugFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "verse" && parts[1]) return parts[1];
  if (parts[0] === "neologizm") return "neologizm";
  if (parts[0] === "rand_verse") return "rand_verse";
  if (parts[0] === "print_copy") return "print_copy";

  return null;
}

function isContentDirection(value: string | null): value is ContentDirection {
  return value === "prev" || value === "next";
}

export function ManageContentOrderOverlay() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const dir = sessionStorage.getItem("manage_dir");
      if (!isContentDirection(dir)) return;

      const htmlName =
        contentSlugFromPath(location.pathname) ??
        localStorage.getItem(STORAGE_KEY) ??
        "neologizm";

      try {
        const content = await fetchContentOrder(htmlName, dir);
        if (cancelled || !content) return;

        localStorage.setItem(STORAGE_KEY, content.html_name);

        // ✅ IMPORTANT: no trailing slash for /verse/:html_name route
        if (content.content === "verse") {
          navigate(`/verse/${content.html_name}`, { replace: true });
        } else if (content.content === "reclamation") {
          navigate("/reclamation", { replace: true });
        } else if (content.content === "neologizm") {
          navigate("/neologizm", { replace: true });
        } else if (content.content === "rand_verse") {
          navigate("/rand_verse", { replace: true });
        } else if (content.content === "print_copy") {
          navigate("/print_copy", { replace: true });
        } else {
          navigate("/neologizm", { replace: true });
        }
      } catch (e) {
        console.error(e);
      } finally {
        sessionStorage.removeItem("manage_dir");
      }
    };

    const handler = () => void run();
    window.addEventListener("manage_tick", handler);

    return () => {
      cancelled = true;
      window.removeEventListener("manage_tick", handler);
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    const slug = contentSlugFromPath(location.pathname);
    if (slug) localStorage.setItem(STORAGE_KEY, slug);
  }, [location.pathname]);

  return null;
}
