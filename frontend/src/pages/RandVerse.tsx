import { Tab, Nav } from "react-bootstrap";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import ReactMarkdown from "react-markdown";

import { triggerManage } from "../api/manageTrigger";
import { randVerse } from "../api/randVerse";
import type { RandVerseInterface } from "../api/randVerse";

import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

type TabKey = "verse" | "hermeneutics";

export const RandVersePage = () => {
  const firstTitle = "слово";
  const secondTitle = "тень";

  const [data, setData] = useState<RandVerseInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const randData = await randVerse();
        if (!cancelled) setData(randData);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const signature: ReactNode = useMemo(
    () => <div className="fst-italic text-end mt-2">Евгений Проскуликов</div>,
    []
  );

  const onTop = useCallback(() => setReload((prev) => !prev), []);
  const onPrev = useCallback(() => triggerManage("prev"), []);
  const onNext = useCallback(() => triggerManage("next"), []);

  const controls = useMemo(
    () => (
      <VerseControls
        tagText="Собрать новый стих"
        prevText="сюда"
        nextText="туда"
        onTop={onTop}
        onPrev={onPrev}
        onNext={onNext}
      />
    ),
    [onTop, onPrev, onNext]
  );

  const newVerseText = useMemo(() => {
    if (!data) return "";
    return Object.values(data.rand_verse).join(" ");
  }, [data]);

  const verseNode: ReactNode = useMemo(
    () => (
      <>
        <ReactMarkdown>{newVerseText}</ReactMarkdown>
        {signature}
      </>
    ),
    [newVerseText, signature]
  );

  const hermNode: ReactNode = useMemo(
    () => (
      <>
        <ReactMarkdown>{data?.herm ?? ""}</ReactMarkdown>
        {signature}
      </>
    ),
    [data?.herm, signature]
  );

  const showNoData = !loading && !data;

  const loadingOverlay = (
    <div
      className="verseLoadingOverlay"
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(255,255,255,0.0)",
        pointerEvents: "none",
      }}
    />
  );

  return (
    <Tab.Container
      id="rand-verse-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
    >
      <Nav variant="tabs" className="custom-tabs tabsWithTools">
        <Nav.Item>
          <Nav.Link eventKey="verse">{firstTitle}</Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="hermeneutics">{secondTitle}</Nav.Link>
        </Nav.Item>

        <Nav.Item className="ms-auto d-flex align-items-center">
          <div className="tabsTool">
            <ThemeSwitcher />
          </div>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="verse">
          <div style={{ position: "relative" }}>
            <VerseBox textMd={verseNode} childrenBottom={controls} />
            {loading && loadingOverlay}
            {showNoData && <div>no data</div>}
          </div>
        </Tab.Pane>

        <Tab.Pane eventKey="hermeneutics">
          <div style={{ position: "relative" }}>
            <VerseBox textMd={hermNode} childrenBottom={controls} />
            {loading && loadingOverlay}
            {showNoData && <div>no data</div>}
          </div>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
