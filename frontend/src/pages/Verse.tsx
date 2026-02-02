import { useSearchParams } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { verse } from "../api/verse";
import type { VerseInterface, VerseType, AudioType, HermType } from "../api/verse";

import { AudioBox } from "../components/AudioBox";
import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";

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

  // Verse order: prefer URL -> prop -> localStorage (if prop is "-1")
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

        // Mark that we have done at least one successful load attempt
        hasLoadedOnceRef.current = true;

        if (data) {
          setVrs(data.verse);
          setHerm(data.herm);
          setAudio(data.audio);

          // If your API helper updates localStorage("verseOrder"),
          // sync it back to state (otherwise keep current verseOrder)
          const stored = localStorage.getItem("verseOrder");
          if (stored) setVerseOrder(stored);

          // fallback if active tab disappears
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

  if (loading || !vrs) {
    return <div>No text, wait…</div>;
  }

  const Signature: ReactNode = (
    <div className="fst-italic text-end mb-5">Евгений Проскуликов</div>
  );

  const controls = (
    <VerseControls
      tagText="This is not poetry"
      prevText="сюда"
      nextText="туда"
      onPrev={() => setStatus("prev")}
      onNext={() => setStatus("next")}
    />
  );

  return (
    <Tabs
      id="verse-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
      className="custom-tabs"
      mountOnEnter
    >
      <Tab eventKey="verse" title="Verse">
        <VerseBox
          titleMd={vrs.title}
          textMd={vrs.text}
          childrenTop={Signature}
          childrenBottom={controls}
        />
      </Tab>

      {herm && (
        <Tab eventKey="hermeneutics" title="Hermeneutics">
          <VerseBox
            titleMd={herm.title}
            textMd={herm.text}
            childrenTop={Signature}
            childrenBottom={controls}
          />
        </Tab>
      )}

      {audio && (
        <Tab eventKey="audio" title="Audio">
          <VerseBox
            childrenTop={<AudioBox audio={audio}>{Signature}</AudioBox>}
            childrenBottom={controls}
          />
        </Tab>
      )}
    </Tabs>
  );
};
