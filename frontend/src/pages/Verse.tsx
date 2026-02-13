import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ManageContentOrder } from "../api/manageContentOrder";
import { useSearchParams, useNavigate } from "react-router-dom"; // ✅ add useNavigate
import { Tab, Nav } from "react-bootstrap";

import { verse } from "../api/verse";
import { reclamationRandomApi } from "../api/reclamation";
import type { ReclamationInterface } from "../api/reclamation";
import type {
  VerseInterface,
  VerseType,
  AudioType,
  HermType,
} from "../api/verse";

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
  const navigate = useNavigate(); // ✅

  const [status, setStatus] = useState<VerseStatus>(() => {
    const s = sp.get("initialStatus") as VerseStatus | null;
    return s ?? initialStatus;
  });

  const [verseOrder, setVerseOrder] = useState<string>(() => {
    const fromUrl = sp.get("initialVerseOrder");
    if (fromUrl) return fromUrl;

    if (initialVerseOrder !== "-1") return initialVerseOrder;

    return localStorage.getItem("verseOrder") ?? "0";
  });

  const [vrs, setVrs] = useState<VerseType | null>(null);
  const [herm, setHerm] = useState<HermType | null>(null);
  const [audio, setAudio] = useState<AudioType | null>(null);
  const [recl, setRecl] = useState<ReclamationInterface | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  const hasLoadedOnceRef = useRef(false);

  // const onPrev = useCallback(() => setStatus("prev"), []);
  const onPrev = () => {
    navigate(`/manage?order=${verseOrder}&dir=prev`);
  };

  // const onNext = useCallback(() => setStatus("next"), []);
  const onNext = () => {
    navigate(`/manage?order=${verseOrder}&dir=next`);
  };

  // ✅ this is the "top" button handler
  const onTop = useCallback(() => {
    const name = recl?.reclamation?.html_name;
    navigate(name ? `/reclamation/${name}` : "/reclamation");
  }, [navigate, recl]);

  const headerTop: ReactNode = useMemo(
    () => (
      <div className="verseMetaRow">
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
        onTop={onTop} // ✅ pass it
        onPrev={onPrev}
        onNext={onNext}
      />
    ),
    [recl, onTop, onPrev, onNext]
  );

  useEffect(() => {
    if (hasLoadedOnceRef.current && status === "current") return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [data, reclData]: [
          VerseInterface | null,
          ReclamationInterface | null
        ] = await Promise.all([verse(status, verseOrder), reclamationRandomApi()]);

        if (cancelled) return;

        hasLoadedOnceRef.current = true;

        if (data) {
          setVrs(data.verse);
          setHerm(data.herm);
          setAudio(data.audio);

          setActiveTab((prev) => {
            if (prev === "hermeneutics" && !data.herm) return "verse";
            if (prev === "audio" && !data.audio) return "verse";
            return prev;
          });

          const stored = localStorage.getItem("verseOrder");
          if (stored && stored !== verseOrder) setVerseOrder(stored);
        } else {
          setVrs(null);
          setHerm(null);
          setAudio(null);
          setActiveTab("verse");
        }

        setRecl(reclData ?? null);

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
  }, [status, verseOrder]);

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
