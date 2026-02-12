import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchContentOrder } from "./fetchContentOrder";

export const ManageContentOrder = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  let order = sp.get("order") ?? "0";
  if (order == "0") {
      order = localStorage.getItem("verseOrder") ?? "0";
  }

  const dir = sp.get("dir") ?? "current";

  useEffect(() => {
    const run = async () => {
      try {
        const content = await fetchContentOrder(order, dir);

        if (!content) return;
        localStorage.setItem("verseOrder", content.order);

        // decision logic lives here
        if (content.content === "verse") {
          navigate(
            `/verse?initialVerseOrder=${content.order}&initialStatus=current`,
            { replace: true }
          );
        } else if (content.content === "reclamation") {
          navigate("/reclamation", { replace: true });
        } else {
          navigate("/rand_verse", { replace: true });
        }
      } catch (e) {
        console.error(e);
      }
    };

    run();
  }, [navigate, order, dir]);

  return null; // nothing rendered
};
