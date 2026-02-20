// src/pages/Download.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { urlPdfFile} from "../api/urls";
import { Tab, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import { pdfText } from "../api/pdfText";
import type { PdfTextInterface } from "../api/pdfText";

import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

type TabKey = "download";

export const Download = () => {
  const navigate = useNavigate();

  const [pdf, setPdf] = useState<PdfTextInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("download");

  const onPrev = () => navigate("/manage?dir=prev");
  const onNext = () => navigate("/manage?dir=next");

  // Replace reclamation button with PDF download
  const onTop = useCallback(() => {
    window.location.href = urlPdfFile;
    console.log(urlPdfFile);
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
    [onTop]
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
      } catch {
        if (!cancelled) setPdf(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!pdf?.herm) return <div>PDF text not found</div>;

  const textNode: ReactNode = (
    <div className="verseTextBody">
      <ReactMarkdown>{pdf.herm.text}</ReactMarkdown>
    </div>
  );

  return (
    <Tab.Container
      id="download-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
      mountOnEnter
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
          <VerseBox
            className="verseBox"
            titleMd={pdf.herm.title}
            textMd={textNode}
            childrenBottom={bottomBlock}
          />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};
