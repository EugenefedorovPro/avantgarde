import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchContentOrder } from "./fetchContentOrder";

export function ManageContentOrderOverlay() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const dir = sessionStorage.getItem("manage_dir") as "prev" | "next" | null;
      if (!dir) return;

      const htmlName = localStorage.getItem("htmlName") ?? "noHtmlName";

      try {
        const content = await fetchContentOrder(htmlName, dir);
        if (cancelled || !content) return;

        localStorage.setItem("htmlName", content.html_name);

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
          // fallback (optional)
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
  }, [navigate]);

  return null;
}
