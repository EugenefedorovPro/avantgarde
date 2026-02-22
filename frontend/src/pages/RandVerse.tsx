import { Tab } from "react-bootstrap";
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

import { TabbedPageShell } from "../components/TabbedPageShell";
import { PaneFrame } from "../components/PaneFrame";
import { Signature } from "../components/Signature";

type TabKey = "verse" | "hermeneutics";

export const RandVersePage = () => {
  const firstTitle = "знак";
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
        <Signature className="mt-2" />
      </>
    ),
    [newVerseText]
  );

  const hermNode: ReactNode = useMemo(
    () => (
      <>
        <ReactMarkdown>{data?.herm ?? ""}</ReactMarkdown>
        <Signature className="mt-2" />
      </>
    ),
    [data?.herm]
  );

  const showNoData = !loading && !data;

  return (
    <TabbedPageShell<TabKey>
      id="rand-verse-tabs"
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
          <VerseBox textMd={verseNode} childrenBottom={controls} />
        </PaneFrame>
      </Tab.Pane>

      <Tab.Pane eventKey="hermeneutics">
        <PaneFrame
          loading={loading}
          empty={showNoData}
          emptyNode={<div>no data</div>}
        >
          <VerseBox textMd={hermNode} childrenBottom={controls} />
        </PaneFrame>
      </Tab.Pane>
    </TabbedPageShell>
  );
};
