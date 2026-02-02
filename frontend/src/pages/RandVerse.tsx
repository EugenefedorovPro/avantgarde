import { Col, Row, Container } from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { randVerse } from "../api/randVerse";
import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import "../pages/Tab.css";
import { SquareButton } from "../components/SquareButton";
import { Verse } from "./Verse";


export const RandVersePage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(true);


  type TabKey = "verse" | "hermeneutics" | "audio";
  const [activeTab, setActiveTab] = useState<TabKey>("verse");

  useEffect(() => {
    const load = async () => {
      try {
        const randData = await randVerse();
        setData(randData);
      } catch (e: any) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reload]);

  // Shared UI blocks
  const Signature: ReactNode = (
    <div className="fst-italic text-end">Евгений Проскуликов</div>
  );

  const controls = (
    <VerseControls
      tagText="Собрать новый стих"
      prevText="сюда"
      nextText="туда"
      onTop={() => setReload(prev => !prev)}
      onPrev={() => navigate("/verse?initialStatus=prev")}
      onNext={() => navigate("/verse?initialStatus=next")}
      buttonWidthVw={100}
      buttonHeightVh={5}
    />
  );

  if (!data) return <div>loading...</div>;

  const newVerse: string = Object.values(data).join(" ");
  console.log(newVerse);

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
          textMd={newVerse}
          childrenTop={Signature}
          childrenBottom={controls}
        />
      </Tab>

      {/* HERMENEUTICS */}
      {
        <Tab eventKey="hermeneutics" title="Hermeneutics">
          <VerseBox
            titleMd=""
            textMd=""
            childrenTop={Signature}
            childrenBottom={controls}
          />
        </Tab>
      }

    </Tabs>


  );
};
