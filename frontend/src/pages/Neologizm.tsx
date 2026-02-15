import { Tab, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, type ReactNode } from "react";

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
      setLoading(true);
      try {
        const randData = await neologizm();
        if (!cancelled) setData(randData);
      } catch (e) {
        console.error(e);
        if (!cancelled) setData(null);
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
      tagText="Переозначить время"
      prevText="сюда"
      nextText="туда"
      onTop={() => {
        setActiveTab("verse"); // ✅ go back to "слово"
        setReload((prev) => !prev); // ✅ refetch data
      }}
      onPrev={() => navigate("/manage?dir=prev")}
      onNext={() => navigate("/manage?dir=next")}
    />
  );

  // ✅ signature at the bottom (after controls)
  const bottom: ReactNode = (
    <>
      {controls}
      {Signature}
    </>
  );

  if (loading) return <div>loading...</div>;
  if (!data || !data.years?.length) return <div>no data</div>;

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
          <VerseBox
            textMd={<NeologizmPretty data={data} />}
            childrenBottom={bottom}
          />
        </Tab.Pane>

        <Tab.Pane eventKey="hermeneutics">
          <VerseBox
            titleMd={data.herm?.title ?? "—"}
            textMd={data.herm?.text ?? "no hermeneutics"}
            childrenBottom={bottom}
          />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
