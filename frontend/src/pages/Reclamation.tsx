// src/pages/Reclamation.tsx
import { Tab, Nav } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { reclamationRandomApi, reclamationByNameApi } from "../api/reclamation";
import type { ReclamationInterface } from "../api/reclamation";

import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";
import { TypewriterRepeat } from "../components/TypewriterRepeat";

export const ReclamationPage = () => {
  const navigate = useNavigate();
  const { html_name } = useParams<{ html_name?: string }>(); // ✅ /reclamation/:html_name?

  const [data, setData] = useState<ReclamationInterface | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ reload logic:
  // - if url has html_name -> fetch deterministic
  // - else -> fetch random and then rewrite url to /reclamation/<html_name>
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = html_name
        ? await reclamationByNameApi(html_name)
        : await reclamationRandomApi();

      setData(d);

      // ✅ if we came to /reclamation (no param), canonize the URL
      const got = d?.reclamation?.html_name;
      if (!html_name && got) {
        navigate(`/reclamation/${got}`, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [html_name, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const Signature: ReactNode = useMemo(
    () => <div className="fst-italic text-end">Евгений Проскуликов</div>,
    []
  );

  const controls = useMemo(
    () => (
      <VerseControls
        tagText={data?.reclamation?.text ?? "…"}
        prevText="сюда"
        nextText="туда"
        onTop={load} // ✅ "top" button reloads (random if no param; deterministic if param)
        onPrev={() => navigate("/verse?initialStatus=prev")}
        onNext={() => navigate("/verse?initialStatus=next")}
      />
    ),
    [data, load, navigate]
  );

  if (loading) return <div>loading...</div>;
  if (!data) return <div>no data</div>;

  return (
    <Tab.Container id="reclamation-tabs" activeKey="shadow">
      <Nav variant="tabs" className="custom-tabs tabsWithTools">
        <Nav.Item>
          <Nav.Link eventKey="shadow">тень</Nav.Link>
        </Nav.Item>

        <Nav.Item className="ms-auto d-flex align-items-center">
          <div className="tabsTool">
            <ThemeSwitcher />
          </div>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="shadow">
          <VerseBox
            textMd={
              <TypewriterRepeat
                markdown={data.answer.text}
                repeat={data.answer.repeat}
                msPerChar={65}
              />
            }
            childrenTop={Signature}
            childrenBottom={controls}
          />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
