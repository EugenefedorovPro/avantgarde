import { Tabs, Tab } from "react-bootstrap";
import { useState, useEffect } from "react";
import { verse } from "../api/verse.ts";
import { HermBox } from "../components/HermBox.tsx";
import { AudioBox } from "../components/AudioBox.tsx";
import type {
  VerseInterface,
  VerseType,
  AudioType,
  HermType,
} from "../api/verse.ts";
import { VerseBox } from "../components/VerseBox.tsx";
import "./Verse.css";

type TabKey = "verse" | "hermeneutics" | "audio";

export const Verse = () => {
  const [status, setStatus] = useState("current");
  const [vrs, setVrs] = useState<VerseType | null>(null);
  const [herm, setHerm] = useState<HermType | null>(null);
  const [audio, setAudio] = useState<AudioType | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data: VerseInterface | null = await verse(status);

        setStatus("current");

        if (data) {
          setVrs(data.verse);
          setHerm(data.herm);
          setAudio(data.audio);

          // reset tab if current tab becomes invalid
          if (!data.herm && activeTab === "hermeneutics") {
            setActiveTab("verse");
          }
          if (!data.audio && activeTab === "audio") {
            setActiveTab("verse");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status]);

  if (loading || !vrs) return <div>No text, wait...</div>;

  console.log("audio");
  console.log(audio);

  return (
    <Tabs
      id="verse-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
      className="mb-3"
      mountOnEnter
    >
      {/* VERSE TAB (always present) */}
      <Tab eventKey="verse" title="Verse">
        <VerseBox
          titleMd={vrs.title}
          textMd={vrs.text}
          author="Евгений Проскуликов"
          tag1Text="голос"
          tag2Text="герменевтика"
          tag3Text="Это не поэзия"
          prevText="сюда"
          nextText="туда"
          onPrev={() => setStatus("prev")}
          onNext={() => setStatus("next")}
        />
      </Tab>

      {/* HERM TAB (only if exists) */}
      {herm && (
        <Tab eventKey="hermeneutics" title="Hermeneutics">
          <div className="p-3">
            <HermBox herm={herm} />
          </div>
        </Tab>
      )}

      {/* AUDIO TAB (only if exists) */}
      {audio && (
        <Tab eventKey="audio" title="Audio">
          <div className="p-3">
            <AudioBox audio={audio} />
          </div>
        </Tab>
      )}
    </Tabs>
  );
};
