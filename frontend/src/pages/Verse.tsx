import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultVerseUrl } from "../api/urls";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, Nav } from "react-bootstrap";

import { verse } from "../api/verse";
import { reclamationRandomApi } from "../api/reclamation";
import type { ReclamationInterface } from "../api/reclamation";
import type { VerseType, AudioType, HermType } from "../api/verse";

import { AudioBox } from "../components/AudioBox";
import { VerseBox } from "../components/VerseBox";
import { VerseControls } from "../components/VerseControls";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

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

  const onPrev = () => navigate(`/manage?dir=prev`);
  const onNext = () => navigate(`/manage?dir=next`);

  const onTop = useCallback(() => {
    const name = recl?.reclamation?.html_name;
    navigate(name ? `/reclamation/${name}` : "/reclamation");
  }, [navigate, recl]);

  // Signature (now meant to be at the bottom)
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
        tagText={recl?.reclamation?.text}
        prevText="сюда"
        nextText="туда"
        onTop={onTop}
        onPrev={onPrev}
        onNext={onNext}
      />
    ),
    [recl, onTop]
  );

  // Bottom area: controls + signature (signature moved down here)
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

    // if you allow /verse without param, decide what to do:
    if (!html_name) {
      setLoading(false);
      setVrs(null);
      navigate(defaultVerseUrl, { replace: true });
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [data, reclData] = await Promise.all([
          verse(html_name), // now guaranteed string
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
        if (!cancelled) {
          setVrs(null);
          setHerm(null);
          setAudio(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [html_name, navigate]);

  if (loading) return <div>Loading…</div>;

  if (!html_name) {
    return <div>No html_name in URL. Use /verse/&lt;html_name&gt;/</div>;
  }

  if (!vrs) {
    return <div>Verse not found: {html_name}</div>;
  }

  return (
    <Tab.Container
      id="verse-tabs"
      activeKey={activeTab}
      onSelect={(k) => k && setActiveTab(k as TabKey)}
      mountOnEnter
    >
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

        <Nav.Item className="ms-auto d-flex align-items-center">
          <div className="tabsTool">
            <ThemeSwitcher />
          </div>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="verse">
          <VerseBox
            className="verseBox verseBox--nowrap"
            titleMd={vrs.title}
            textMd={vrs.text}
            childrenBottom={bottomBlock}
          />
        </Tab.Pane>

        {herm && (
          <Tab.Pane eventKey="hermeneutics">
            <VerseBox
              titleMd={herm.title}
              textMd={herm.text}
              childrenBottom={bottomBlock}
            />
          </Tab.Pane>
        )}

        {audio && (
          <Tab.Pane eventKey="audio">
            <VerseBox
              childrenTop={<AudioBox audio={audio}>{signature}</AudioBox>}
              childrenBottom={controls}
            />
          </Tab.Pane>
        )}
      </Tab.Content>
    </Tab.Container>
  );
};
