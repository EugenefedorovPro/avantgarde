import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab } from "react-bootstrap";

import { triggerManage } from "../api/manageTrigger";
import { defaultVerseUrl } from "../api/urls";
import { verse } from "../api/verse";
import { reclamationRandomApi } from "../api/reclamation";
import type { ReclamationInterface } from "../api/reclamation";
import type { VerseType, AudioType, HermType } from "../api/verse";

import { AudioBox } from "../components/AudioBox";
import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

import { TabbedPageShell, type TabDef } from "../components/TabbedPageShell";
import { PaneFrame } from "../components/PaneFrame";
import { Signature } from "../components/Signature";

type TabKey = "verse" | "hermeneutics" | "audio";

export const Verse = () => {
  const navigate = useNavigate();
  const { html_name } = useParams<{ html_name: string }>();

  const [vrs, setVrs] = useState<VerseType | null>(null);
  const [herm, setHerm] = useState<HermType | null>(null);
  const [audio, setAudio] = useState<AudioType | null>(null);
  const [recl, setRecl] = useState<ReclamationInterface | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  const hasLoadedOnceRef = useRef(false);

  const onPrev = useCallback(() => triggerManage("prev"), []);
  const onNext = useCallback(() => triggerManage("next"), []);

  const onTop = useCallback(() => {
    const name = recl?.reclamation?.html_name;
    navigate(name ? `/reclamation/${name}` : "/reclamation");
  }, [navigate, recl]);

  const controls = useMemo(
    () => (
      <VerseControls
        tagText={recl?.reclamation?.text}
        prevText="сюда"
        nextText="туда"
        onTop={onTop}
        onPrev={onPrev}
        onNext={onNext}
      />
    ),
    [recl, onTop, onPrev, onNext]
  );

  const sigVerse = useMemo(
    () => (
      <div className="text-end fst-italic">
        {vrs?.date_of_writing && (
          <span className="me-2">{vrs.date_of_writing}</span>
        )}
        <Signature />
      </div>
    ),
    [vrs?.date_of_writing]
  );

  const sigHerm = useMemo(
    () => (
      <div className="text-end fst-italic">
        {herm?.date_of_writing && (
          <span className="me-2">{herm.date_of_writing}</span>
        )}
        <Signature />
      </div>
    ),
    [herm?.date_of_writing]
  );

  const bottomVerse = useMemo(
    () => (
      <>
        {controls}
        {sigVerse}
      </>
    ),
    [controls, sigVerse]
  );

  const bottomHerm = useMemo(
    () => (
      <>
        {controls}
        {sigHerm}
      </>
    ),
    [controls, sigHerm]
  );

  useEffect(() => {
    let cancelled = false;

    if (!html_name) {
      setLoading(false);
      navigate(defaultVerseUrl, { replace: true });
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [data, reclData] = await Promise.all([
          verse(html_name),
          reclamationRandomApi(),
        ]);

        if (cancelled) return;

        hasLoadedOnceRef.current = true;
        setRecl(reclData);

        if (data) {
          setVrs(data.verse);
          setHerm(data.herm);
          setAudio(data.audio);

          setActiveTab((prev) => {
            if (prev === "hermeneutics" && !data.herm) return "verse";
            if (prev === "audio" && !data.audio) return "verse";
            return prev;
          });
        } else {
          setVrs(null);
          setHerm(null);
          setAudio(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [html_name, navigate]);

  const showNotFound = !loading && !!html_name && !vrs;

  const tabs: Array<TabDef<TabKey>> = useMemo(() => {
    const t: Array<TabDef<TabKey>> = [{ key: "verse", title: "знак" }];
    if (herm) t.push({ key: "hermeneutics", title: "тень" });
    if (audio) t.push({ key: "audio", title: "звук" });
    return t;
  }, [herm, audio]);

  return (
    <TabbedPageShell<TabKey>
      id="verse-tabs"
      activeKey={activeTab}
      onSelect={setActiveTab}
      toolsRight={<ThemeSwitcher />}
      tabs={tabs}
    >
      <Tab.Pane eventKey="verse">
        <PaneFrame
          loading={loading && !hasLoadedOnceRef.current}
          empty={showNotFound}
          emptyNode={<div>Verse not found: {html_name}</div>}
        >
          <VerseBox
            className="verseBox verseBox--nowrap"
            titleMd={vrs?.title ?? ""}
            textMd={vrs?.text ?? ""}
            childrenBottom={bottomVerse}
          />
        </PaneFrame>
      </Tab.Pane>

      {herm && (
        <Tab.Pane eventKey="hermeneutics">
          <PaneFrame loading={false}>
            <VerseBox
              titleMd={herm.title}
              textMd={herm.text}
              childrenBottom={bottomHerm}
            />
          </PaneFrame>
        </Tab.Pane>
      )}

      {audio && (
        <Tab.Pane eventKey="audio">
          <PaneFrame loading={false}>
            <VerseBox
              childrenTop={<AudioBox audio={audio}>{sigVerse}</AudioBox>}
              childrenBottom={controls}
            />
          </PaneFrame>
        </Tab.Pane>
      )}
    </TabbedPageShell>
  );
};
