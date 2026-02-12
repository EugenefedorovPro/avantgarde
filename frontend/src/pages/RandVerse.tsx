import { Tab, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

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
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(true);

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

    load();

    return () => {
      cancelled = true;
    };
  }, [reload]);

  const Signature: ReactNode = (
    <div className="fst-italic text-end">Евгений Проскуликов</div>
  );

  const controls = (
    <VerseControls
      tagText="Собрать новый стих"
      prevText="сюда"
      nextText="туда"
      onTop={() => setReload((prev) => !prev)}
      onPrev={() => navigate("/manage?dir=prev")}
      onNext={() => navigate("/manage?dir=next")}
    />
  );

  if (loading) return <div>loading...</div>;
  if (!data) return <div>no data</div>;

  const newVerse = Object.values(data.rand_verse).join(" ");

  return (
    <Tab.Container
      id="rand-verse-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
      mountOnEnter
    >
      {/* Tabs bar + Theme switcher on the right */}
      <Nav variant="tabs" className="custom-tabs tabsWithTools">
        <Nav.Item>
          <Nav.Link eventKey="verse">{firstTitle}</Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="hermeneutics">{secondTitle}</Nav.Link>
        </Nav.Item>

        {/* Right-aligned tool area */}
        <Nav.Item className="ms-auto d-flex align-items-center">
          <div className="tabsTool">
            <ThemeSwitcher />
          </div>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="verse">
          <VerseBox
            textMd={newVerse}
            childrenTop={Signature}
            childrenBottom={controls}
          />
        </Tab.Pane>

        <Tab.Pane eventKey="hermeneutics">
          <VerseBox textMd={data.herm} childrenTop={Signature} childrenBottom={controls} />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
