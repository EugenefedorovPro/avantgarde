import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Tab, Nav } from "react-bootstrap";
import ReactMarkdown from "react-markdown";

import { triggerManage } from "../api/manageTrigger";
import { urlPdfFile } from "../api/urls";
import { pdfText } from "../api/pdfText";
import type { PdfTextInterface } from "../api/pdfText";

import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

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

  const signature: ReactNode = useMemo(
    () => (
      <div
        className="verseMetaRow"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          textAlign: "right",
          width: "100%",
        }}
      >
        <div className="fst-italic mb-0">Евгений Проскуликов</div>
      </div>
    ),
    []
  );

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
    if (!pdf?.herm?.text) return "";
    return (
      <div className="verseTextBody">
        <ReactMarkdown>{pdf.herm.text}</ReactMarkdown>
      </div>
    );
  }, [pdf?.herm?.text, pdf?.herm?.text]);

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
      id="download-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
    >
      <Nav variant="tabs" className="custom-tabs tabsWithTools">
        <Nav.Item>
          <Nav.Link eventKey="download">ART</Nav.Link>
        </Nav.Item>

        <Nav.Item className="ms-auto d-flex align-items-center">
          <div className="tabsTool">
            <ThemeSwitcher />
          </div>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="download">
          <div style={{ position: "relative" }}>
            <VerseBox
              className="verseBox"
              titleMd={pdf?.herm?.title ?? (loading ? "—" : "PDF")}
              textMd={textNode}
              childrenBottom={bottomBlock}
            />
            {loading && loadingOverlay}
            {showNotFound && <div>PDF text not found</div>}
          </div>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
