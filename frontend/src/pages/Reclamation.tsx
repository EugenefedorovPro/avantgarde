import { Tab, Nav } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { triggerManage } from "../api/manageTrigger";
import { reclamationRandomApi, reclamationByNameApi } from "../api/reclamation";
import type { ReclamationInterface } from "../api/reclamation";

import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";
import { TypewriterRepeat } from "../components/TypewriterRepeat";

export const ReclamationPage = () => {
  const navigate = useNavigate();
  const { html_name } = useParams<{ html_name?: string }>();

  const [data, setData] = useState<ReclamationInterface | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = html_name
        ? await reclamationByNameApi(html_name)
        : await reclamationRandomApi();

      setData(d);

      const got = d?.reclamation?.html_name;
      if (!html_name && got) {
        navigate(`/reclamation/${got}`, { replace: true });
      }
    } catch (e) {
      console.error(e);
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

  const onPrev = useCallback(() => triggerManage("prev"), []);
  const onNext = useCallback(() => triggerManage("next"), []);

  const controls = useMemo(
    () => (
      <VerseControls
        tagText={data?.reclamation?.text ?? "…"}
        prevText="сюда"
        nextText="туда"
        onTop={load}
        onPrev={onPrev}
        onNext={onNext}
      />
    ),
    [data?.reclamation?.text, load, onPrev, onNext]
  );

  const bottomBlock: ReactNode = useMemo(
    () => (
      <>
        {controls}
        {Signature}
      </>
    ),
    [controls, Signature]
  );

  const showNoData = !loading && !data;

  const loadingOverlay = (
    <div
      className="verseLoadingOverlay"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "rgba(255,255,255,0.0)",
      }}
    />
  );

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
          <div style={{ position: "relative" }}>
            <VerseBox
              textMd={
                <TypewriterRepeat
                  markdown={data?.answer?.text ?? ""}
                  repeat={data?.answer?.repeat ?? 1}
                  msPerChar={65}
                />
              }
              childrenBottom={bottomBlock}
            />

            {loading && loadingOverlay}
            {showNoData && <div>no data</div>}
          </div>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
