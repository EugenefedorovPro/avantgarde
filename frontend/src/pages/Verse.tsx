import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { verse } from "../api/verse.ts";
import type { VerseInterface } from "../api/verse.ts";
import { SquareButton } from "../components/SquareButton.tsx";
import "./Verse.css";

export const Verse = () => {
  const [status, setStatus] = useState<string>("current");
  const [vrs, setVrs] = useState<VerseInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await verse(status);
        // reset status
        setStatus("current");
        // save data
        if (data) setVrs(data);
      } catch (e) {
        console.log(e);
      } finally {
        // reset loading
        setLoading(false);
      }
    };

    load();
  }, [status]);

  const newVerse = (newStatus: string) => {
    setStatus(newStatus);
  };

  console.log(`status within Verse: ${status}`);

  if (loading || !vrs) return <div>No text, wait...</div>;

  return (
    <Container className="verseBox">
      <Row>
        <Col>
          <ReactMarkdown>{vrs.text}</ReactMarkdown>
        </Col>
      </Row>

      <Row>
        <div className="text-end fst-italic">Евгений Проскуликов</div>
      </Row>

      <Row>
        <Col className="mt-5 d-flex justify-content-center">
          <SquareButton widthVw={90} heightVh={5} text="голос" />
        </Col>
      </Row>

      <Row>
        <Col className="mt-1 d-flex justify-content-center">
          <SquareButton widthVw={90} heightVh={5} text="герменевтика" />
        </Col>
      </Row>

      <Row>
        <Col className="mt-1 d-flex justify-content-center">
          <SquareButton widthVw={90} heightVh={5} text="Это не поэзия" />
        </Col>
      </Row>

      <Row>
        <Col className="d-flex justify-content-between mt-1 mb-3">
          <SquareButton
            onClick={() => newVerse("prev")}
            widthVw={90}
            heightVh={5}
            text="сюда"
          />
          <SquareButton
            onClick={() => newVerse("next")}
            widthVw={90}
            heightVh={5}
            text="туда"
          />
        </Col>
      </Row>
    </Container>
  );
};
