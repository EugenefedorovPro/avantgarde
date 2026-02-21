import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, Nav } from "react-bootstrap";

import { defaultVerseUrl } from "../api/urls";
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

  // Signature (meant to be at the bottom)
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

  // Bottom area: controls + signature
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

    if (!html_name) {
      // keep shell stable; just redirect
      setLoading(false);
      setVrs(null);
      setHerm(null);
      setAudio(null);
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
          // true not-found from API
          setVrs(null);
          setHerm(null);
          setAudio(null);
        }
      } catch (e) {
        if (!cancelled) {
          // If you want to KEEP previous content on transient errors, comment these out:
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

  // IMPORTANT: do NOT return early on loading/not-found
  const showNotFound = !loading && !!html_name && !vrs;

  const loadingOverlay = (
    <div
      className="verseLoadingOverlay"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.55)",
        pointerEvents: "none",
      }}
    >
      <div>Loading…</div>
    </div>
  );

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
          <div style={{ position: "relative" }}>
            <VerseBox
              className="verseBox verseBox--nowrap"
              // allow empty on initial mount; after first load you keep old content visible while loading
              titleMd={vrs?.title ?? ""}
              textMd={vrs?.text ?? ""}
              childrenBottom={bottomBlock}
            />
            {loading && loadingOverlay}
            {showNotFound && <div>Verse not found: {html_name}</div>}
          </div>
        </Tab.Pane>

        {herm && (
          <Tab.Pane eventKey="hermeneutics">
            <div style={{ position: "relative" }}>
              <VerseBox
                titleMd={herm.title}
                textMd={herm.text}
                childrenBottom={bottomBlock}
              />
              {loading && loadingOverlay}
            </div>
          </Tab.Pane>
        )}

        {audio && (
          <Tab.Pane eventKey="audio">
            <div style={{ position: "relative" }}>
              <VerseBox
                childrenTop={<AudioBox audio={audio}>{signature}</AudioBox>}
                childrenBottom={controls}
              />
              {loading && loadingOverlay}
            </div>
          </Tab.Pane>
        )}
      </Tab.Content>
    </Tab.Container>
  );
};
