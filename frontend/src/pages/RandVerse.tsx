import { Tab, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";

import { randVerse } from "../api/randVerse";
import type { RandVerseInterface } from "../api/randVerse";
import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

type TabKey = "verse" | "hermeneutics";

export const RandVersePage = () => {
  const firstTitle = "слово";
  const secondTitle = "тень";

  const navigate = useNavigate();

  const [data, setData] = useState<RandVerseInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // IMPORTANT: do NOT clear UI, just start loading
      setLoading(true);
      try {
        const randData = await randVerse();
        if (!cancelled) setData(randData);
      } catch (e) {
        console.error(e);
        // IMPORTANT: keep previous data on transient errors
        // if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reload]);

  const signature: ReactNode = useMemo(
    () => <div className="fst-italic text-end mt-2">Евгений Проскуликов</div>,
    []
  );

  const controls = useMemo(
    () => (
      <VerseControls
        tagText="Собрать новый стих"
        prevText="сюда"
        nextText="туда"
        onTop={() => setReload((prev) => !prev)}
        onPrev={() => navigate("/manage?dir=prev")}
        onNext={() => navigate("/manage?dir=next")}
      />
    ),
    [navigate]
  );

  const newVerse = useMemo(() => {
    if (!data) return "";
    return Object.values(data.rand_verse).join(" ");
  }, [data]);

  const verseWithSignature: ReactNode = useMemo(
    () => (
      <>
        <ReactMarkdown>{newVerse}</ReactMarkdown>
        {signature}
      </>
    ),
    [newVerse, signature]
  );

  const hermWithSignature: ReactNode = useMemo(
    () => (
      <>
        <ReactMarkdown>{data?.herm ?? ""}</ReactMarkdown>
        {signature}
      </>
    ),
    [data?.herm, signature]
  );

  // IMPORTANT: no more "if (loading) return ...".
  // Keep the shell rendered always.
  const showNoData = !loading && !data;

  const loadingOverlay = (
    <div
      className="verseLoadingOverlay"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.0)", // set >0 if you want dimming
        pointerEvents: "none",
      }}
    >
      {/* leave empty if you want ZERO visible loading indicator */}
      {/* <div>Loading…</div> */}
    </div>
  );

  return (
    <Tab.Container
      id="rand-verse-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
      mountOnEnter
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
            <VerseBox textMd={verseWithSignature} childrenBottom={controls} />
            {/* keep old verse visible while fetching new */}
            {loading && loadingOverlay}
            {showNoData && <div>no data</div>}
          </div>
        </Tab.Pane>

        <Tab.Pane eventKey="hermeneutics">
          <div style={{ position: "relative" }}>
            <VerseBox textMd={hermWithSignature} childrenBottom={controls} />
            {loading && loadingOverlay}
            {showNoData && <div>no data</div>}
          </div>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
