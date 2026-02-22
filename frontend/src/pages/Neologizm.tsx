import { Tab } from "react-bootstrap";
import { useMemo, useState, useEffect, type ReactNode } from "react";

import { triggerManage } from "../api/manageTrigger";
import { neologizm } from "../api/neologizm";
import type { NeologizmInterface } from "../api/neologizm";

import { NeologizmPretty } from "../components/NeologizmPretty";
import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

import { TabbedPageShell } from "../components/TabbedPageShell";
import { PaneFrame } from "../components/PaneFrame";
import { Signature } from "../components/Signature";

type TabKey = "verse" | "hermeneutics";

export const Neologizm = () => {
  const firstTitle = "слово";
  const secondTitle = "тень";

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

    void load();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const signature: ReactNode = useMemo(() => <Signature />, []);

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
        onPrev={() => triggerManage("prev")}
        onNext={() => triggerManage("next")}
      />
    ),
    []
  );

  const bottom: ReactNode = useMemo(
    () => (
      <>
        {controls}
        {signature}
      </>
    ),
    [controls, signature]
  );

  const showNoData = !loading && (!data || !data.years?.length);

  return (
    <TabbedPageShell<TabKey>
      id="neologizm-tabs"
      activeKey={activeTab}
      onSelect={setActiveTab}
      toolsRight={<ThemeSwitcher />}
      tabs={[
        { key: "verse", title: firstTitle },
        { key: "hermeneutics", title: secondTitle },
      ]}
    >
      <Tab.Pane eventKey="verse">
        <PaneFrame
          loading={loading}
          empty={showNoData}
          emptyNode={<div>no data</div>}
        >
          <VerseBox
            textMd={data ? <NeologizmPretty data={data} /> : ""}
            childrenBottom={bottom}
          />
        </PaneFrame>
      </Tab.Pane>

      <Tab.Pane eventKey="hermeneutics">
        <PaneFrame
          loading={loading}
          empty={showNoData}
          emptyNode={<div>no data</div>}
        >
          <VerseBox
            titleMd={data?.herm?.title ?? "—"}
            textMd={data?.herm?.text ?? ""}
            childrenBottom={bottom}
          />
        </PaneFrame>
      </Tab.Pane>
    </TabbedPageShell>
  );
};
