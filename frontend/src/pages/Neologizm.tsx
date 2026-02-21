import { Tab, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, type ReactNode } from "react";

import { neologizm } from "../api/neologizm";
import type { NeologizmInterface } from "../api/neologizm";

import { NeologizmPretty } from "../components/NeologizmPretty";
import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

type TabKey = "verse" | "hermeneutics";

export const Neologizm = () => {
  const firstTitle = "слово";
  const secondTitle = "тень";

  const navigate = useNavigate();

  const [data, setData] = useState<NeologizmInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // IMPORTANT: start loading but do NOT blank the UI
      setLoading(true);

      try {
        const randData = await neologizm();
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

  const Signature: ReactNode = useMemo(
    () => <div className="fst-italic text-end">Евгений Проскуликов</div>,
    []
  );

  const controls = useMemo(
    () => (
      <VerseControls
        tagText="Переозначить время"
        prevText="сюда"
        nextText="туда"
        onTop={() => {
          setActiveTab("verse");
          setReload((prev) => !prev);
        }}
        onPrev={() => navigate("/manage?dir=prev")}
        onNext={() => navigate("/manage?dir=next")}
      />
    ),
    [navigate]
  );

  // signature at the bottom (after controls)
  const bottom: ReactNode = useMemo(
    () => (
      <>
        {controls}
        {Signature}
      </>
    ),
    [controls, Signature]
  );

  // IMPORTANT: no early returns for loading (keeps tabs + frame visible)
  const showNoData = !loading && (!data || !data.years?.length);

  // Overlay exists but shows nothing (so user sees zero loading indicator).
  // Keep it if you want to optionally add a spinner later.
  const loadingOverlay = (
    <div
      className="verseLoadingOverlay"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "rgba(255,255,255,0.0)", // set >0 if you want dimming
      }}
    />
  );

  return (
    <Tab.Container
      id="neologizm-tabs"
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
            <VerseBox
              textMd={data ? <NeologizmPretty data={data} /> : ""}
              childrenBottom={bottom}
            />
            {loading && loadingOverlay}
            {showNoData && <div>no data</div>}
          </div>
        </Tab.Pane>

        <Tab.Pane eventKey="hermeneutics">
          <div style={{ position: "relative" }}>
            <VerseBox
              titleMd={data?.herm?.title ?? "—"}
              textMd={data?.herm?.text ?? ""}
              childrenBottom={bottom}
            />
            {loading && loadingOverlay}
            {showNoData && <div>no data</div>}
          </div>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
