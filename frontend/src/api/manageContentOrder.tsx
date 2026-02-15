import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchContentOrder } from "./fetchContentOrder";

export const ManageContentOrder = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const htmlName = localStorage.getItem("htmlName") ?? "noHtmlName";

  const dir = sp.get("dir") ?? "current";

  useEffect(() => {
    const run = async () => {
      try {
        const content = await fetchContentOrder(htmlName, dir);

        if (!content) return;
        localStorage.setItem("htmlName", content.html_name);

        // decision logic lives here
        if (content.content === "verse") {
          navigate(`/verse/${content.html_name}/`, {
            replace: true,
          });
        } else if (content.content === "reclamation") {
          navigate("/reclamation", { replace: true });
        } else if (content.content === "neologizm") {
          navigate("/neologizm", { replace: true });
        } else {
          navigate("/rand_verse", { replace: true });
        }
      } catch (e) {
        console.error(e);
      }
    };

    run();
  }, [navigate, htmlName, dir]);

  return null; // nothing rendered
};
