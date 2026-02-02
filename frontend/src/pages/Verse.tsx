import { useSearchParams } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { verse } from "../api/verse";
import { AudioBox } from "../components/AudioBox";
import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";
import type {
  VerseInterface,
  VerseType,
  AudioType,
  HermType,
} from "../api/verse";
import "./Verse.css";
import "./Tab.css";

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
  // read url tags
  const [sp] = useSearchParams();
  const [status, setStatus] = useState(
    sp.get("initialStatus") ?? initialStatus
  );

  const [verseOrder, setVerseOrder] = useState(
    sp.get("initialVerseOrder") ?? initialVerseOrder
  );
  console.log(`verseOrder = ${verseOrder}`);
  // if no initialVerseOrder arg is passes, order -> get from local storage
  // if no arg in local storage -> order = 0
  if (verseOrder == "-1") {
    setVerseOrder(localStorage.getItem("verseOrder") ?? "0");
  }
  console.log(`verseOrder = ${verseOrder}`);

  const [vrs, setVrs] = useState<VerseType | null>(null);
  const [herm, setHerm] = useState<HermType | null>(null);
  const [audio, setAudio] = useState<AudioType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("verse");


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data: VerseInterface | null = await verse(status, verseOrder);
        setStatus("current");

        if (data) {
          setVrs(data.verse);
          setHerm(data.herm);
          setAudio(data.audio);
          setVerseOrder(localStorage.getItem("verseOrder") ?? "-1");

          // fallback if active tab disappears
          if (!data.herm && activeTab === "hermeneutics") {
            setActiveTab("verse");
          }
          if (!data.audio && activeTab === "audio") {
            setActiveTab("verse");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status]);

  if (loading || !vrs) {
    return <div>No text, wait…</div>;
  }

  // Shared UI blocks
  const Signature: ReactNode = (
    <div className="fst-italic text-end">Евгений Проскуликов</div>
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
      {/* VERSE */}
      <Tab eventKey="verse" title="Verse">
        <VerseBox
          titleMd={vrs.title}
          textMd={vrs.text}
          childrenTop={Signature}
          childrenBottom={controls}
        />
      </Tab>

      {/* HERMENEUTICS */}
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

      {/* AUDIO */}
      {audio && (
        <Tab eventKey="audio" title="Audio">
          <VerseBox
            childrenTop={<AudioBox audio={audio} children={Signature} />}
            childrenBottom={controls}
          />
        </Tab>
      )}
    </Tabs>
  );
};
