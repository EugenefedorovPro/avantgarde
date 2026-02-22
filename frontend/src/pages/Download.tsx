import { Tab } from "react-bootstrap";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";

import { triggerManage } from "../api/manageTrigger";
import { urlPdfFile } from "../api/urls";
import { pdfText } from "../api/pdfText";
import type { PdfTextInterface } from "../api/pdfText";

import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

import { TabbedPageShell } from "../components/TabbedPageShell";
import { PaneFrame } from "../components/PaneFrame";
import { Signature } from "../components/Signature";

type TabKey = "download";

export const Download = () => {
  const [pdf, setPdf] = useState<PdfTextInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("download");

  const onPrev = useCallback(() => triggerManage("prev"), []);
  const onNext = useCallback(() => triggerManage("next"), []);

  const onTop = useCallback(() => {
    window.location.href = urlPdfFile;
  }, []);

  const signature: ReactNode = useMemo(() => <Signature />, []);

  const controls = useMemo(
    () => (
      <VerseControls
        tagText="PDF"
        prevText="сюда"
        nextText="туда"
        onTop={onTop}
        onPrev={onPrev}
        onNext={onNext}
      />
    ),
    [onTop, onPrev, onNext]
  );

  const bottomBlock: ReactNode = useMemo(
    () => (
      <>
        {controls}
        {signature}
      </>
    ),
    [controls, signature]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const pdfData = await pdfText();
        if (!cancelled) setPdf(pdfData);
      } catch (e) {
        console.error(e);
        if (!cancelled) setPdf(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const showNotFound = !loading && !pdf?.herm;

  const textNode: ReactNode = useMemo(() => {
    const text = pdf?.herm?.text;
    if (!text) return "";
    return (
      <div className="verseTextBody">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    );
  }, [pdf?.herm?.text]);

  return (
    <TabbedPageShell<TabKey>
      id="download-tabs"
      activeKey={activeTab}
      onSelect={setActiveTab}
      toolsRight={<ThemeSwitcher />}
      tabs={[{ key: "download", title: "ART" }]}
    >
      <Tab.Pane eventKey="download">
        <PaneFrame
          loading={loading}
          empty={showNotFound}
          emptyNode={<div>PDF text not found</div>}
        >
          <VerseBox
            className="verseBox"
            titleMd={pdf?.herm?.title ?? (loading ? "—" : "PDF")}
            textMd={textNode}
            childrenBottom={bottomBlock}
          />
        </PaneFrame>
      </Tab.Pane>
    </TabbedPageShell>
  );
};
