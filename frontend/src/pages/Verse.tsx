import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Tab, Nav } from "react-bootstrap";

import { verse } from "../api/verse";
import type { VerseInterface, VerseType, AudioType, HermType } from "../api/verse";

import { AudioBox } from "../components/AudioBox";
import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";

import { ThemeSwitcher } from "../theme/ThemeSwitcher";

type TabKey = "verse" | "hermeneutics" | "audio";
type VerseStatus = "current" | "next" | "prev";

type VerseProps = {
  initialStatus?: VerseStatus;
  initialVerseOrder?: string;
};

export const Verse = ({
  initialStatus = "current",
  initialVerseOrder = "-1",
}: VerseProps) => {
  const [sp] = useSearchParams();

  // Status from URL (one-time at mount)
  const [status, setStatus] = useState<VerseStatus>(() => {
    const s = sp.get("initialStatus") as VerseStatus | null;
    return s ?? initialStatus;
  });

  // Verse order: URL -> prop -> localStorage (if prop is "-1") -> "0"
  const [verseOrder, setVerseOrder] = useState<string>(() => {
    const fromUrl = sp.get("initialVerseOrder");
    if (fromUrl) return fromUrl;

    if (initialVerseOrder !== "-1") return initialVerseOrder;

    return localStorage.getItem("verseOrder") ?? "0";
  });

  const [vrs, setVrs] = useState<VerseType | null>(null);
  const [herm, setHerm] = useState<HermType | null>(null);
  const [audio, setAudio] = useState<AudioType | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  // Prevent a "second fetch" after we reset status back to "current"
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    // If we already loaded once, and status is "current" (because we reset it),
    // do NOT fetch again.
    if (hasLoadedOnceRef.current && status === "current") return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data: VerseInterface | null = await verse(status, verseOrder);
        if (cancelled) return;

        hasLoadedOnceRef.current = true;

        if (data) {
          setVrs(data.verse);
          setHerm(data.herm);
          setAudio(data.audio);

          // If API helper updates localStorage("verseOrder"), sync it back.
          const stored = localStorage.getItem("verseOrder");
          if (stored) setVerseOrder(stored);

          // If current tab no longer exists, fallback to Verse.
          if (!data.herm && activeTab === "hermeneutics") setActiveTab("verse");
          if (!data.audio && activeTab === "audio") setActiveTab("verse");
        }

        // Reset command-like status back to "current" WITHOUT triggering another fetch
        if (status !== "current") setStatus("current");
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [status, verseOrder, activeTab]);

  // Controls (stable JSX, no re-creation noise)
  const controls = useMemo(
    () => (
      <VerseControls
        tagText="This is not poetry"
        prevText="сюда"
        nextText="туда"
        onPrev={() => setStatus("prev")}
        onNext={() => setStatus("next")}
      />
    ),
    []
  );

  // Top inside VerseBox: ONLY signature now (ThemeSwitcher is global in tabs bar)
  const headerTop: ReactNode = useMemo(
    () => (
      <div className="verseMetaRow">
        <div className="fst-italic mb-0">Евгений Проскуликов</div>
      </div>
    ),
    []
  );

  if (loading || !vrs) {
    return <div>No text, wait…</div>;
  }

  return (
    <Tab.Container
      id="verse-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
      mountOnEnter
    >
      {/* Tabs bar + Theme switcher on the right */}
      <Nav variant="tabs" className="custom-tabs tabsWithTools">
        <Nav.Item>
          <Nav.Link eventKey="verse">стих</Nav.Link>
        </Nav.Item>

        {herm && (
          <Nav.Item>
            <Nav.Link eventKey="hermeneutics">смысл</Nav.Link>
          </Nav.Item>
        )}

        {audio && (
          <Nav.Item>
            <Nav.Link eventKey="audio">звук</Nav.Link>
          </Nav.Item>
        )}

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
            titleMd={vrs.title}
            textMd={vrs.text}
            childrenTop={headerTop}
            childrenBottom={controls}
          />
        </Tab.Pane>

        {herm && (
          <Tab.Pane eventKey="hermeneutics">
            <VerseBox
              titleMd={herm.title}
              textMd={herm.text}
              childrenTop={headerTop}
              childrenBottom={controls}
            />
          </Tab.Pane>
        )}

        {audio && (
          <Tab.Pane eventKey="audio">
            <VerseBox
              childrenTop={<AudioBox audio={audio}>{headerTop}</AudioBox>}
              childrenBottom={controls}
            />
          </Tab.Pane>
        )}
      </Tab.Content>
    </Tab.Container>
  );
};
