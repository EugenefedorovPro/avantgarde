import { Col, Row, Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import { randVerse } from "../api/randVerse";
import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { SquareButton } from "../components/SquareButton";

export const RandVersePage = () => {
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
  }, []);
  
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
      buttonWidthVw={100}
      buttonHeightVh={5}
    />
  );

  if (!data) return <div>loading...</div>;

  const newVerse: string = Object.values(data).join(" ");
  console.log(newVerse);

  return (
    <VerseBox
      textMd={newVerse}
      childrenTop={Signature}
      childrenBottom={controls}
    />
  );
};
