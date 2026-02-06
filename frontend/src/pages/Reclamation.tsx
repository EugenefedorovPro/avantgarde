// src/pages/Reclamation.tsx
import { Tab, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { reclamationApi } from "../api/reclamation";
import type { ReclamationInterface } from "../api/reclamation";

import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";
import { TypewriterRepeat } from "../components/TypewriterRepeat";

export const ReclamationPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<ReclamationInterface | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await reclamationApi();
      setData(d);
    } finally {
      setLoading(false);
    }
  }, []);

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
        onTop={load}
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
